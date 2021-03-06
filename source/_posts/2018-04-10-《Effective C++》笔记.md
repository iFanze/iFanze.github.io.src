---
title: 《Effective C++》笔记
date: 2018-04-10 16:53:56
categories: 笔记
tags: 
    - C++
    - 读书
toc: true
comments: true
---

刚入职时看《Effective C++》记录的笔记

<!-- more -->
<!-- toc -->

0 导读
========

术语
------

- 声明式（declaration）。
- 签名式（signature）。
- 定义式（definition）。
- 初始化（initialization）。

- default 构造函数是一个可被调用而不带任何实参的函数，或者每个参数都有缺省值。
- 用 `explicit` 修饰的构造函数不能执行隐式类型转换。如：

~~~~~c++
class B {
public:
    explicit B(int x  = 0, bool b = true);
};
void doSomething(B bObject);

doSomething(28);       //错误
doSomething(B(28));    //正确
~~~~~

- copy construction 被用来“以同型对象初始化自我对象”。
- copy assignment 被用来“从另一个同型对象中拷贝其值到自我对象”。

~~~~~c++
class Widget {
public:
    Widget();                                       // default construction
    Widget(const Widget& rhs);                      // copy construction
    Widget& operator=(const Widget& rhs);           // copy assignment
}

Widget w1;                            // default construction
Widget w2(w1);                    // copy construction
Widget w3 = w2;                  // copy construction
w1 = w2;                              // copy assignment

bool doSomething(Widget w);
doSomething(w1);              // copy construction (passed by value)
~~~~~

- undefined behavior。

~~~~~c++
int *p = 0;
std::out << *p;
char name[] = "abc";
char c = name[10];
~~~~~

1 让自己习惯C++
==============

条款01：View C++ as a federation of languages.
-----------------------------------------------------------------

C++ 现在已经是一个多重范型编程语言（multiparadigm programming language），同时支持过程形式（procedural）、面向对象形式（object-oriented）、函数形式（functional）、泛型形式（generic）、元编程形式(metaprogramming）。

可将 C++ 视为由以下几个次语言构成：

- C
- Object-Oriented C++
- Template C++
- STL

条款02：Prefer consts, enums, and inlines to #defines.
-----------------------------------------------------------------------------

使用 const 替换 #define 的好处：

- 方便追踪编译错误。
- 使用 symbolic debugger 时将其记录进符号表。

注意两点：

- Constant pointers 的 const 有两种形式：

~~~~~c++
const char* const name = "Scott";
// 当然最好用：
const std::string name("Scott");
~~~~~

- Class的专属常量用 static：

~~~~~c++
class GamePlayer{
private:
    static const int NumTurns = 5;      // 声明式
    int scores[NumTurns];
};

const int GamePlayer::NumTurns;     //定义式，不要放在头文件中，不用给数值。
~~~~~

C++ 通常要求对使用的任何东西提供一个定义式，这里类的 static 的整数类型（integral type: int, char, bool）只要不取他们的地址就可以不用声明式。但如果需要取地址或编译器坚持需要定义式，就必须提供定义式。并且这种“in-class 初值设定”也只允许对整数常量进行。

旧时编译器可能要将初值设定放在定义式中，如果编译期间一定要知道该常量值，比如这里 scores 数组的声明，可以使用“the enum hack”补偿做法，即`enum { NumTurns = 5 };`。

这样做的好处有：

- 它的行为更像 #define 而不像 const，比如不支持取地址。
- 优秀的编译器不会为“整型 const 对象”设定另外的空间，除非你创建一个指向该对象的 pointer 或 reference，而不够优秀的编译器却可能如此。Enums 不会导致非必要的你内存分配。
- 是 template metaprogramming 的基础技术，非常实用。

另外，#define 的另一个误用情况是用来实现宏（macros），缺点很多。应使用 template inline 函数，可带来宏的效率以及一般函数的所有可预料行为和类型安全性（type safety）。

~~~~~c++
template<typename T>
inline void callWithMax(const T& a, const T& b)
{
    f(a > b ? a : b);
}
~~~~~

条款03：Use const whenever possible.
-------------------------------------------------------

const 的一般用法：

~~~~~c++
const char* p;     // 被指物是常量，同 char const * p;
char* const p;    // 指针自身是常量。

const std::vector<int>::iterator iter;     //  T* const，指针本身是常量。
std::vector<int>::const_iterator cIter;  //  const T*，被指物是常量。
~~~~~

const 在函数的返回值、参数、成员函数自身都有很强大的用法。

- 函数返回常量值，可在不放弃安全性和高效性的同时降低使用意外。比如，有理数的乘法操作符：

~~~~~c++
class Rational { ... };
const Rational operator* (const Rational& lhs, const Rational& rhs);
// 阻止了使用类似 if ( a * b = c ) 这样的代码。
~~~~~

- 使用 const 参数阻止对参数的改动。
- 使用 const 成员函数一可使 class 的接口更容易被理解，二是使操作 const 对象成为可能。

C++的一个重要特性：两个成员函数如果只是常量性（constness）不同，可以被重载。

~~~~~c++
class TextBlock {
public:
    const char& operator[] (std::size_t postion) const { return text[position]; }
    char & operator[] (std::size_t position) { return text[position]; }
...
}

TextBlock tb("hello");
std::cout << tb[0];
tb[0] = 'x';
const TextBlock ctb("world");
std::cout << ctb[0];
ctb[0] = 'x';        // 错误。
~~~~~

成员函数如果是 const 意味着什么？

- bitwise constness（physical constness）：成员函数不更改对象的任何成员变量（任何 bit），这是编译器理解的 const。但存在这种情况：

~~~~~c++
class TextBlock {
public:
    char& operator[] (std::size_t postion) const { return text[position]; }
private:
    char* pText;
...
}

const TextBlock ctb("hello");
char* pc = &ctb[0];
*pc = 'J';            // 正确。
~~~~~

- logical constness（conceptual constness）：成员函数可以修改它所处理的对象内的某些 bits，但只有在客户侦测不出的情况下才得如此。这是编写程序时应具备的习惯。

~~~~~c++
class TextBlock {
public:
    ...
    std::size_t length() const;
private:
    char* pText;
    std::size_t textLength;
    bool lengthIsValid;
};
std::size_t TextBlock::length() const{
    if (!lengthIsValid) {
        textLength = std::strlen(pText);      // 错误，const 成员函数内不能改变这些变量值。
        lengthIsValid = true;
    }
    return textLength;
}
~~~~~

解决方法是把`textLength`和`lengthIsValid`声明为mutable。

对于第一个 TextBlock 例子，还有个问题，如果函数体很长，如还包括边界检验（bounds checking）、日志访问信息（logged access info）、数据完善性检验等，会有大量的重复代码。

这时可利用常量性转除（casting away constness），即便一般来说使用 casting 是一个糟糕的想法。

~~~~~c++
const char& TextBook::operator[] (std::size_t postion) const {
    ...
    ...
    ...
    return text[postion];
}
char& TextBook::operator[] (std::size_t postion) {
    return const_cast<char&>(
                static_cast<const TextBlock&>(*this)[position]
    );
}
~~~~~

先转为 const TextBlock& 再将 const 属性移除。

条款04：Make sure that objects are initialized before they're used.
-------------------------------------------------------------------------------------------

初始化（initialization）和赋值（assignment）是两个概念。

请对类的所有成员变量使用 member initialization list 方式进行初始化。

如果是有多个构造函数，为避免代码冗长，可将性能差不多的初始化封装到函数中转变成赋值函数，实现伪初始化（pseudo-initialization）。

初始化的顺序是固定的，按照声明次序，而不是初始化列表的次序。


对于不同编译单元内定义的 non-local static 对象（包括 global 对象、定义于 namespace 作用域内的对象、在 classes 内、在函数内、在 file 作用域内被声明为 static 的对象），C++ 并无明确定义。为应对这种情况，应以 local static 对象替换 non-local static 对象，这也是 Singleton 模式的思想。


2 Constructors, Destructors, and Assignment Operators
==========================================================


条款05：Know what functions C++ silently writes and calls.
----------------------------------------------------------

~~~~~c++
class Empty {
public:
    Empty() { ... }
    Empty(const Empty& rhs) { ... }
    ~Empty() { ... }

    Empty& operator=(const Empty& rhs) { ... }
};
~~~~~

这些函数惟有在被需要的时候才会创建。

注意析构函数是 non-virtual 的，除非基类有 virtual 析构函数。

默认的 copy 构造函数：使用调用相应成员类型的 copy 构造函数，或者通过拷贝每一个 bits 来对每个成员变量进行初始化。

默认的 copy assignment：同上，但若生成的代码不合法或者没有机会证明它有意义，则不会生成。

~~~~~c++
template<class T>
class NamedObject {
...
private:
    std::string& nameValue;
    const T objectValue;
};

NamedObject<int> p(str1, 2);
NamedObject<int> s(str2, 3);
p = s;                          // 由于 reference 不能改变指向，const 成员无法被修改，所以不会生成 copy assignment
~~~~~

条款06：Explicitly disallow the use of compiler-generated functions you do not want.
------------------------------------------------------------------------------------

定义为 private，可以阻止人们调用它。（编译器报错）

为了进一步阻止成员函数和 friend 函数调用，应只声明而不去定义这些函数。（连接器报错）

为了方便使用，可以让它继承这样的 Uncopyable 基类：

~~~~~c++
class Uncopyable {
protected:
    Uncopyable() { }
    ~Uncopyable() { }
private:
    Uncopyable(const Uncopyable&);
    Uncopyable& operator=(const Uncopyable&);
};
~~~~~

并且，使用时不一定要用 public 继承它，析构函数不一定得是 virtual。可能导致多重继承，多重继承有时会阻止这种 empty base class optimization。

Boost 库里也有相关的版本，叫 noncopyable。


条款07：Declare destructors virtual in polymorphic base classes.
----------------------------------------------------------------

基类指针指向派生类，只有在析构函数为虚函数的情况下才能销毁整个派生类对象。

但也不能因此把所有类的析构函数都声明成 virtual，由于这份信息由 vptr（virtual table pointer）指向的 vtbl（virtual table）维护，这会增大每个对象的大小。许多人的心得是：只有当 class 内含有至少一个 virtual 函数，才为它声明 virtual destructor。

注意：string 类的析构函数是 non-virtual 的。

进一步的，可将析构函数声明为 pure virtual 以实现抽象类。注意提供一份定义，因为编译器会在派生类的析构函数中创建对 ~AWOV 的调用。

~~~~~c++
class AWOV {
public:
    virtual ~AWOV( ) = 0;
};
~~~~~

注意，给 base classes 一个 virtual 析构函数，这个规则只适用于 polymorphic（带多态性质的）base classes 身上。因为有些基类的设计并不是为了多态，甚至不是为了继承。

条款08：Prevent exceptions from leaving destructors.
------------------------------------------------------

不鼓励在析构函数中抛出异常，会导致程序过早结束或不明确行为。

所以可以将这些逻辑从析构函数转移到普通函数，交由用户进行调用。

若析构函数必须处理异常，则要在捕捉到异常后吞下不传播或者结束程序。


条款09：Never call virtual functions during construction or destruction
------------------------------------------------------------------------

在基类构造期间，virtual 函数不是 virtual 函数。

构造函数中调用的函数里调用了 virtual functions 的情况更加难以发现。


条款10：Have assignment operators return a reference to *this.
----------------------------------------------------------------

以支持连锁赋值。


条款11：Handle assignment to self in operator=
-----------------------------------------------

三种方式：

- 证同测试（identity test）。

~~~~~c++
if (this == &rhs) 
    return *this;
~~~~~

- 把焦点放在实现异常安全性（exception safety）上。复制指针所指空间前保证别删除原空间。这样甚至不需要进行证同测试，因为证同测试也需要成本。

~~~~~c++
Widget& Widget::operator=(const Widget& rhs){
    Bitmap* pOrig = pb;
    pb = new Bitmap(*rhs.pb);
    delete pOrig;
    return *this;
}
~~~~~

- 使用 copy and swap 技术。（详见条款 29）。

~~~~~c++
Widget& Widget::operator=(const Widget& rhs){
    Widget temp(rhs);
    swap(temp);				// 成员函数，交换*this和参数。
    return *this;
}
~~~~~

这种方式可以以 by value 的方式进行优化，牺牲清晰性，却可令编译器有时生成更高效的代码。

~~~~~c++
Widget& Widget::operator=(Widget rhs){
    swap(rhs);
    return *this;
}
~~~~~

条款12：Copy all parts of an object.
---------------------------------------

当为一个类编写 copy constructor 或者 copy assignment 时，请确保：

1. 赋值所有 local 成员变量。
2. 调用所有 base classes 内的适当 copying 函数。

当然，不能在 copy assignment 操作符中调用 copy 构造函数。
反之同样无意义。
如果重复代码较多，不妨建立一个 init 成员函数。



3 资源管理
==========


条款13：Use objects to manage resources.
------------------------------------------


把资源放进对象内，在析构函数中确保资源被释放。


对于单一区块或函数内的资源，应该在控制流离开那个区块或函数时被释放，可以利用标准库中的`auto_ptr`，即智能指针，其析构函数自动对其所指对象调用 delete。如：

~~~~~c++
void f(){
    std::auto_ptr<Investment> pInv(createInvestment());
    ...
}
~~~~~

体现的思想：

- 获得资源后立刻放进管理对象，即资源取得时机便是初始化时机（Resource Acquisition Is Initialization, RAII）。（在构造函数中获得资源）
- 运用析构函数确保资源被释放。（在析构函数中释放资源）

注意：使用`auto_ptr`时不要让多个该指针指向同一对象，为此，它有个性质：若通过 copy constructor 或 copy assignment 复制它们，它们会变成 null。

这意味着`auto_ptr`并非管理动态分配资源的神兵利器，例如，STL 容器要求其元素发挥正常的复制行为，所以这些容器容不得`auto_ptr`。

它的一个替代方案是引用计数型智慧指针（reference-counting smart pointer，RCSP）。追踪有多少对象指向该资源，实现类似垃圾回收（garbage collection）的行为，不同的是无法打破环状引用（cycles of references）。它的一种实现就是 TR1 的tr1::shared_ptr。

注意，这两个方案都是在其析构函数中做 delete 而不是 delete[]。因此不能用在动态分配而得的 array 身上，即便它能通过编译：

~~~~~c++
std::auto_ptr<std::string> aps(new std::string[10]);
std::tr1::shared_ptr<int> spi(new int[1024]);
~~~~~

这种时候推荐用 vector 和 string。


条款14：Think carefully about copying behavior in resource-managing classes.
---------------------------------------------------------------------------

有时你需要简历自己的资源管理类，一个例子：

~~~~~c++
class Lock {
public:
    explicit Lock(Mutex* pm) : mutexPtr(pm){
        lock(mutexptr);			// 构造时加锁
    }							// 析构时释放
    ~Lock(){
        unlock(mutexPtr);
    }
    private:
        Mutex *mutexPtr;		// 互斥器对象
}

// 使用方式：
Mutex m;
...
{
    Lock m1(&m);
    ...
}
~~~~~

这很好，但如果Lock对象被复制（一个RAII对象被复制），会发生什么事？可能的选择：

- 禁止复制。
- 引用计数法。对这个例子，可以将 mutexPtr 改为 `tr1::shared_ptr`类型，但由于引用次数为0时默认执行的是释放操作而不是 unlock，需要在构造时为它指定第二个参数：删除器（deleter）。

~~~~~c++
class Lock {
public:
    explicit Lock(Mutex* pm) : mutexPtr(pm, unlock){		// 增加了一个参数
        lock(mutexPtr.get());								// 使用get，条款15。
    }					
    // 不用再定义析构函数。
    private:
        std::tr1::shared_ptr<Mutex> mutexPtr;		// 互斥器对象使用 shared_ptr
}

// 使用方式：
Mutex m;
...
{
    Lock m1(&m);
    ...
}
~~~~~

- 复制底部资源。即深度复制（deep copying）。
- 转移底部资源的拥有权。

条款15：Provide access to raw resources in resource-managing class
--------------------------------------------------------------------

例如你使用`auto_ptr`或`tr1::shared_ptr`对某类对象进行管理，而 API 要求使用该对象的原始指针。这时可用 get() 成员函数进行显式转换，获得智能指针内部的原始指针（的复件）。当然，这两个类也实现了`operator*`和`operator->`，用于隐式转换。

如果是自己写的类，也可提供类似 get() 的接口。也最好提供隐式转换的接口，如从`auto_ptr<Font>`转为`FontHandle`：

~~~~~c++
class Font{
public:
    ...
    operator FontHandle() const { return f; }
    ...
}
~~~~~

但是这样会增加出错的情况：

~~~~~c++
Font f1(getFont());
FontHandle f2 = f1;		// 会执行隐式转换后复制，而不是直接复制。
~~~~~

所以不太推荐，要权衡。

RAII 类暴露原始资源与“封装性”并不矛盾，它的存在并不是为了封装而是为了确保一个特殊行为——资源释放——会放生。


条款16：Use the same form in corresponding uses of new and delete
--------------------------------------------------------------------

new 用 delete，new ...[x] 用 delete[]，混用会产生未定义的行为。

尽量避免对数组类型进行 typedef。


条款17：Store newed objects in smart pointers in standalone statements.
----------------------------------------------------------------------

以独立语句将新对象置于智能指针，否则有资源泄漏的风险。如：

~~~~~c++
processWidget(std::tr1::shared_ptr<Widget>(new Widget), priority());
~~~~~

因为 C++ 编译器未必是在 shared_ptr 将新对象添加进来之前执行 priority()，若这时 priority() 出错，新资源的指针会遗失。


4 设计与声明
=============


条款18：Make interfaces easy to use correctly and hard to use incorrectly.
-----------------------------------------------------------------------------


- 好的接口很容易被正确使用，不容易被误用。
- 促进被正确使用的方法包括：接口的一致性、与内置类型的行为兼容。
- 阻止误用的方法包括：建立新类型、限制类型上的操作、束缚对象值、消除客户的资源管理责任。
- tr1::shared_ptr 支持定制型删除器，这可防范 cross-DLL problem，即在一个 DLL 中被 new 创建，却在另一个 DLL 中被 delete 销毁。
- 使用 tr1::shared_ptr 等消除某些客户错误的同时，也值得我们关注其使用成本。



条款19：Treat class design as type design.
-------------------------------------------

- 新 type 的对象应该如何被创建和销毁？（构造、析构、new、delete）
- 对象的初始化和赋值有什么样的区别？
- 新 type 的对象如果被 passed by value，意味着什么？（copy constructor）
- 什么是新 type 的合法值？
- 你的新 type 需要配合某个继承图系（inheritance graph）吗？（受其束缚，如 virtual）
- 你的新 type 需要什么样的转换？
- 什么样的操作符和函数对此新 type 而言是合理的？
- 什么样的标准函数应该驳回？（声明为 private）
- 谁该取用新 type 的成员？（public/private/protected、friends）
- 什么是新 type 的未声明接口（undeclared interface）？
- 你的新 type 有多么一般化？（class template）
- 你真的需要一个新 type 吗？（使用 non-member function 或者 template？）


条款20：Prefer pass-by-reference-to-const to pass-by-value.
--------------------------------------------------------------

更高效，且可避免切割问题（slicing problem）。

你可以合理假设“pass-by-value 并不昂贵”的唯一对象就是内置类型、STL 迭代器、函数对象。


条款 21：Don't try to return a reference when you must return an object.
-------------------------------------------------------------------------

比如`operator*`。

绝不要返回一个指向 local stack 上对象的 pointer 或 reference，或返回 reference 指向一个 heap-allocated 对象，或返回 pointer 或 reference 指向一个 local static 对象而有可能同时需要多个这样的对象。

条款22：Declare data members private.
--------------------------------------

- 语法一致性。
- 细微划分访问控制。
- 封装性与“当其内容改变时可能造成的代码破坏量”成反比。
- protected 并不比 public 更具封装性。


条款23：Prefer non-member non-friend functions to member functions.
--------------------------------------------------------------------

可以增加封装性、包裹弹性（packaging flexibility）、机能扩充性。

比如一些便利函数：

~~~~~c++
class WebBrowser{
public:
    ...
    void clearCache();
    void clearHistory();
    void removeCookies();
    ...
    void clearEverything();		// member function的写法。
    ...
}

void clearBrowser(WebBrowser& wb){ ... }	// non-member，non-friend的写法。

~~~~~

另外，如果有很多这样的便利函数，可以按照机能划分到不同的头文件、不同的 namespace 下。


条款24：Declare non-member functions when type conversions should apply to all parameters
------------------------------------------------------------------------------------------------

比如想要创建一个实数类，让它既能实现“Rational * int”，又想让它能够实现“int * Rational”的运算（内含隐性转换），就需要：

~~~~~c++
class Rational {
    ...
};

const Rational operator*(const Rational& lhs, const Rational &rhs){ ... } 
~~~~~

注意，不用把它声明为 friend，friend 能避免就避免。


条款25：Consider support for a non-throwing swap.
--------------------------------------------------

（有点绕）


5 实现
=======

条款26：Postpone variable definitions as long as possible.
------------------------------------------------------------

尽可能延后变量定义式的出现。


条款27：Minimize casting.
--------------------------

两种旧式转型：

~~~~~c++
(T) expr;
T(expr);
~~~~~

四种新式转型：

- `const_cast<T>(expr)`。常量性转除（cast away the constness）。
- `dynamic_cast<T>(expr)`。安全向下转型（safe downcasting）。执行速度很慢。
- `reinterpret_cast<T>(expr)`。低级转换，行为取决于编译器（不可抑制），很少用。
- `static_cast<T>(expr)`。强迫隐式转换，包括：

    * non-const 转 const
    * int 转 double
    * void* 转 T*
    * pointer-to-base 转 pointer-to-derived


唯一使用旧时转型的时机：explicit 构造函数。

~~~~~c++
class Widget {
public:
    explicit Widget(int size);
    ...
};
void doSomeWork(const Widget& w);
doSomeWork(Widget(15));
doSomeWork(static_cast<Widget>(15));
~~~~~

转型可能会做很多事，甚至在基类指针转化为派生类指针时会改变指针的地址。

dynamic_cast 一般用于将基类指针转为派生类指针，然后执行派生类中才有的函数。但尽量用派生类的指针类型或在基类中声明 virtual 来避免使用它。

如果转型是必要的，把它隐匿在函数中，不要交给客户。


条款28：Avoid returning "handles" to object internals.
-------------------------------------------------------

避免返回指向对象内部某对象的 handles（包括 references、pointers、iterators），会破坏封装性。

如果是返回 const 的对象引用，记得用两个 const，即便如此，也存在着“handle 比其所指对象更长寿”的风险。


条款29：Strive for exception-safe code.
----------------------------------------

异常安全性的两个条件：

- 当异常被抛出时，不泄露任何资源。
- 当异常被抛出时，不允许数据败坏。


异常安全函数（Exception-safe function）提供以下三个保证之一：

- 基本承诺：如果异常被抛出，程序内的任何事物仍然保持在有效状态下。
- 强烈保证：如果异常被抛出，程序状态不改变（恢复到调用前的状态）。（copy-and-swap）
- 不抛掷（nothrow）保证：承诺绝不抛出异常，

（有个例子没仔细看）


条款30：Understand the ins and outs of inlining.
-------------------------------------------------

- 将大多数 inlining 限制在小型、被频繁使用的函数上。
- 不要只因为 function templates 出现在头文件，将就它们声明为 inline。

条款31：Minimize compilation dependecies between files.
--------------------------------------------------------

支持“编译依存性最小化”的一般构想是：相依于声明式，不要相依于定义式。可以使用 Handle classes 和 Interface classes。

程序库头文件应该以“完全且仅有声明式”（full and declaration-only forms）的形式存在。这种做法不论是否涉及 templates 都适用。


一个例子：

~~~~~c++
class Person {
public:
    virtual ~Person();
    virtual std::string name() const = 0;
    virtual std::string birthday() const = 0;
    
    static std::tr1::shared_ptr<Person> create(
        const std::string& name,
        const Date& birthday
    );
};

class RealPerson: public Person {
public:
    RealPerson(const std::string& name, const Date& birthday)
        : theName(name), theBirthday(birthday)
        {}
    virtual ~RealPerson(){ }
    std::string name() const; 			//略去实现
    std::string birthday() const;		//略去实现
private:
    std::string theName;
    Date theBirthday;
};

std::tr1::shared_ptr<Person> Person::create(const std::string name, 
                                            const Date& birthday){
    return std::tr1::shared_ptr<Person>(new RealPerson(name, birthday));
}

std::tr1::shared_ptr<Person> pp(Person::create(name, dateOfBirth));
~~~~~

6 继承与面向对象设计
=====================


条款32：Make sure public inheritance models "is-a."
----------------------------------------------------

public 继承意味着“is-a”，适用于 base classes 身上的每一件事一定也适用于 derived classes 身上。


条款33：Avoid hiding inherited names.
---------------------------------------

- derived classes 内的名称会遮掩 base classes 内的名称。在 public 继承下从来没有人希望如此。
- 为了让被遮掩的名称再见天日，可使用 using 声明式或转交函数（forwarding functions）。


条款34：Differentiate between inheritance of interface and inheritance of implementation.
-----------------------------------------------------------------------------------------------------

- 接口继承和实现继承不同 ，在 public 继承之下，derived classes 总是继承 base class 的接口。
- pure virtual 函数只具体指定接口继承。
- impure virtual 函数具体指定接口继承及缺省实现继承。
- non-virtual 函数具体指定接口继承以及强制性实现继承。


条款35：Consider alternatives to virtual functions
---------------------------------------------------

virtual 的替代方案：

- 使用 non-virtual interface（NVI）手法，那是 Template Method 设计模式的一种特殊模式。它以 public non-virtual 成员函数包裹较低访问性（private 或 protected）的 virtual 函数。
- 将 virtual 函数替换为“函数指针成员变量”，这是 Strategy 设计模式的一种分解表现形式。
- 以 tr1::function 成员变量替换 virtual 函数，因而允许使用任何可调用物（callable entity）搭配一个兼容于需求的签名式。这也是 Strategy 设计模式的某种形式。
- 将继承体系内的 vitual 函数替换为另一个继承体系的 virtual 函数。这是 Strategy 设计模式的传统实现手法。


条款36：Never redefine an inherited non-virtual function.
----------------------------------------------------------



条款37：Never redefine a function's inherited default parameter value.
------------------------------------------------------------------------

~~~~~c++
class Shape {
public:
    virtual void draw(ShapeColor color = Red) const = 0;
}

class Rectangle: public Shape{
public:
    virtual void draw(ShapeColor color = Green) const;
}

class Circle: public Shape{
public:
    virtual void draw(ShapeColor color)const;
}
...

Shape* pr = new Rectangle;
pr->draw();
~~~~~


- Rectangle 中赋予了不同的缺省参数值，很槽糕。
- 这里 pr 调用的是派生类复写后的 virtual 函数，但是缺省参数不是 Green 而是 Red（由静态类型决定）。
- 使用virtual 函数的替代设计，如 NVI（non-virtual interface）：

~~~~~c++
class Shape {
public:
    void draw(ShapeColor color = Red) const
    {
        doDraw(color);
    }
private:
    virtual void doDraw(ShapeColor color) const = 0;
}

class Rectangle: public Shape{
public:
    virtual void doDraw(ShapeColor color = Green) const;
}

class Circle: public Shape{
public:
    virtual void doDraw(ShapeColor color)const;
}

~~~~~


条款38：Model "has-a" or "is-implemented-in-terms-of" through composition.
---------------------------------------------------------------------------

复合（composition），同义词有分层（layering）、内含（containment）、聚合（aggregation）、内嵌（embedding）等。它的意义（has-a）和 public 继承（is-a）完全不同。


条款39：Use private inheritance judiciously.
---------------------------------------------

- private 继承意味着 is-implemented-in-terms-of（根据某物实现出）。通常比复合（composition）的级别低，但当派生类需要访问 protected base class 的成员，或需重新定义继承而来的 virtual 函数时，这么设计是合理的。
- 和复合不同，private 继承可以造成 empty base 最优化。这对致力于“对象尺寸最小化”的程序库开发者而言，可能很重要。

条款40：Use multiple inheritance judiciously.
-------------------------------------------------

- 多重继承比单一继承复杂。它可能导致新的歧义性，以及对 virtual 继承的需要。
- virtual 继承会增加大小、速度、初始化及赋值复杂度等等成本。如果 virtual base classes 不带任何数据，将是最具使用价值的情况。
- 多重继承的确有正当用途。其中一个情节涉及“public 继承某个 Interface class”和“private 继承某个协助实现的 class”的组合。


7 模板和范型编程
====================

条款41：Understand implicit interfaces and compile-time polymorphism.
------------------------------------------------------------------------

- classes 和 templates 都支持接口（interfaces）和多态（polymorphism）。
- 对 classes 而言接口是显式的，以函数签名为中心。多态则是通过 virtual 函数发生于运行期。
- 对 template 参数而言，接口是隐式的，奠基于有效表达式。多态则是通过 template 具现化和函数重载解析，发生于编译期。


条款42：Understand the two meanings of typename.
-------------------------------------------------

- 声明 template 参数时，前缀关键字 class 和 typename 可互换。
- typename 还有个功能是标识嵌套从属类型名称（nested dependent name）。但不得在 base class lists 或 member initialization list 内使用。

一个正确的使用例子：

~~~~~c++
template<typename IterT>
void workWithIterator(IterT iter)
{
    typedef typename std::iterator_traits<IterT>::value_type value_type;
    value_type temp(*iter);
    ...
}
~~~~~


条款43：Know how to access names in templatized base classes.
--------------------------------------------------------------

当我们从 Object Oriented C++ 跨进 Template C++ 后，继承就没有那样畅行无阻了。

~~~~~c++
template<typename Company>
class LoggingMsgSender: public MsgSender<Company> {
public:
    ...
    void sendClearMsg(const MsgInfo& info)
    {
        ...
        sendClear(info);		// 调用基类函数，无法通过编译。
        ...
    }
}	
~~~~~

三种解决方式：

1. 调用前加上`this->`。
2. 使用using声明式。
3. 使用作用域声明符明确指示，但会关闭 virtual 绑定行为。


条款44：Factor parameter-independent code out of templates.
------------------------------------------------------------

- Templates 生成多个 classes 和多个函数，所以任何 template 代码都不该与某个造成膨胀的 template 参数产生相依关系。
- 因非类型模板参数（non-type template parameters）而造成的代码膨胀，往往可消除，做法是以函数参数或 class 成员变量替换 template 参数。
- 因类型参数（type parameters）而造成的代码膨胀，往往可降低，做法是让带有完全相同二进制表述（binary representations）的具现类型（instantiation types）共享实现码。

