---
title: golang从0-1
date: 2018-09-16 19:48:19
tags: "golang"
paths: "2018091601"
---



##### 1. go 语言基本构成

```golang

package main //当前程序得包名

import "fmt"  //导入其他包

import std "fmt"  //导入包别名

const PI = 3.14  //常量定义

var name = "list"  //全局变量得声明与赋值

type newType int //一般类型声明

type gopher struct {} //结构声

type golang interface {} //接口得声明

func main(){    //由main函数作为程序得入口启动

    fmt.Println("hello go")

}

```
---
##### 2.函数命名
- 函数名首字母小写 即为 priveate  (私有方法)
- 函数名首字母大写 即为public      (公共的)


##### 3.组声明

```golang


//常量组
const (
    a = 1
    b = 2
    c = 3
)


var (

    name1 = "a"
    name2 = "b"
    name3 = "c"

)


type (

    type1 = "a"
    type3 = "b"
    type3 = "c"

)

```
<!-- more -->
##### 4.基本类型

- 布尔类型

> bool  长度:1 Byte  取值范围 true/false  不可以用其他数字代表

- 整型:int/uint
> 根据平台可能为32位或64位
- 8位整形int8/uint8 长度:1 Byte   去值范围 -128~127/0~255

- 字节型：byte （uint8 别名）

- 16位整型： int16/uint16  长度2 Byte

- 32位: int32/uint32  长度4 Byte

- 浮点型：float32/float 64 || 4/8Byte || 7/15位小数

- 复数： complex64/ complex128  8/16 Byte

- 足够保存指针的32位或64位整数型 ： unintptr

- 其他值类型： array \ struct \ string

- 引用类型：slice \ map \ chan

- 派生类型
    (a) 指针类型（Pointer）
    (b) 数组类型
    (c) 结构化类型(struct)
    (d) Channel 类型
    (e) 函数类型
    (f) 切片类型
    (g) 接口类型（interface）
    (h) Map 类型

- 接口类型：inteface

- 函数类型：func

- 零值类型：值类型 默认为0 \ bool 为false \ string 为空字符串

- 单个变量的声明与赋值

> 变量的声明格式：var <变量名称> <变量类型>

> 变量的赋值格式： <变量名称> = <表达式>

> 声明的同时赋值：var <变量名称> <变量类型> = <表达式>

- 多变量的声明赋值

```golang

var (  //全局变量组
a = 1
b = 2
)

a, b, c := 1, 2, 3

var a,b,c = 1,2,3

var a,b,c int

var a,b,c int = 1, 2, 3

a, _ ,c,d = 1,2,3,4

- //空白符

```

- 变量的类型转换 （go中不存在类型转换，所有类型转换必须显示声明）


```golang

    var a float32 = 100.1

    b := int(a)

    fmt.Print(b)


    //数字转字符串
    var a int = 65
    b := string(a)

    fmt.Print(b)


	var a int = 65
	b := strconv.Itoa(a)

	fmt.Print(b)


	const (
	a = 1
	b   //此时b = 1
    )

```
- iota 常量计数器  //没定义一个 自增1，没遇到一个const 关键字都会重置为0

- 运算符

```

// 算术运算符
+	相加
-	相减
*	相乘
/	相除
%	求余
++	自增
--	自减

// 关系运算符
==	检查两个值是否相等，如果相等返回 True 否则返回 False。	(A == B) 为 False
!=	检查两个值是否不相等，如果不相等返回 True 否则返回 False。	(A != B) 为 True
>	检查左边值是否大于右边值，如果是返回 True 否则返回 False。	(A > B) 为 False
<	检查左边值是否小于右边值，如果是返回 True 否则返回 False。	(A < B) 为 True
>=	检查左边值是否大于等于右边值，如果是返回 True 否则返回 False。	(A >= B) 为 False
<=	检查左边值是否小于等于右边值，如果是返回 True 否则返回 False。	(A <= B) 为 True


// 逻辑运算符

&&	逻辑 AND 运算符。 如果两边的操作数都是 True，则条件 True，否则为 False。	(A && B) 为 False
||	逻辑 OR 运算符。 如果两边的操作数有一个 True，则条件 True，否则为 False。	(A || B) 为 True
!	逻辑 NOT 运算符。 如果条件为 True，则逻辑 NOT 条件 False，否则为 True。


// 位运算符


&	按位与运算符"&"是双目运算符。 其功能是参与运算的两数各对应的二进位相与。	(A & B) 结果为 12, 二进制为 0000 1100
|	按位或运算符"|"是双目运算符。 其功能是参与运算的两数各对应的二进位相或	(A | B) 结果为 61, 二进制为 0011 1101
^	按位异或运算符"^"是双目运算符。 其功能是参与运算的两数各对应的二进位相异或，当两对应的二进位相异时，结果为1。	(A ^ B) 结果为 49, 二进制为 0011 0001
<<	左移运算符"<<"是双目运算符。左移n位就是乘以2的n次方。 其功能把"<<"左边的运算数的各二进位全部左移若干位，由"<<"右边的数指定移动的位数，高位丢弃，低位补0。	A << 2 结果为 240 ，二进制为 1111 0000
>>	右移运算符">>"是双目运算符。右移n位就是除以2的n次方。 其功能是把">>"左边的运算数的各二进位全部右移若干位，">>"右边的数指定移动的位数。

//赋值运算符

=	简单的赋值运算符
+=	相加后再赋值
-=	相减后再赋值
*=	相乘后再赋值
/=	相除后再赋值
%=	求余后再赋值
<<=	左移后赋值
>>=	右移后赋值
&=	按位与后赋值
^=	按位异或后赋值
|=	按位或后赋值


//其他运算符

&	返回变量存储地址	&a; 将给出变量的实际地址。
*	指针变量。	*a; 是一个指针变量

```
- 循环for关键字得使用

```golang
	// 第一种
	a :=1
	for  {
		if a > 3 {
			break
		}
		fmt.Println(a)
		a++
	}

	//第二种
	a:=0
	for a <3 {
		fmt.Println(a)
		a++
	}

	//第三中

	for a:=0;a<3 ;a++  {
		fmt.Println(a)
	}
```

- switch 语句，不用写break,case 满足条件执行完自动退出

```golang
	// 第1种
a:=1

	switch  a{
	case 0:
		fmt.Println("a=1")
	case 1:
		fmt.Println("a=1")
	case 2:
		fmt.Println("a=2")
	default:
		fmt.Println("a=null")
	}

	// 第2种
	a:=0

	switch {
	case a>0:
		fmt.Println("a=1")
	case a==0:
		fmt.Println("a=0")
	case a<0:
		fmt.Println("a=-1")
	default:
	}

	// 第3种 fallthrough 关键字 可以匹配下一个满足得条件
		a:=0

	switch {
	case a>=0:
		fmt.Println("a=1")
		fallthrough
	case a==0:
		fmt.Println("a=0")
	case a<0:
		fmt.Println("a=-1")
	default:
	}

```

- goto,break,continue 跳转语句

```
// break 得使用，跳转到指定循环外层
LEV1:
		for {
			for i:=0; i<10; i++ {
				fmt.Println(i)
				if i > 3{
					break LEV1
				}
			}
		}
//goto 跳转得指定位置，
		for {
			for i:=0; i<10; i++ {
				fmt.Println(i)
				if i > 3{
					goto LEV1
				}
			}
		}
	fmt.Println("lev")

	LEV1:
	fmt.Println("lev1")
//continue 跳转循环层
LEV1:
	for i:=0; i<10; i++ {
			for {
				fmt.Println(i)
				continue LEV1
				fmt.Println("lev1")
			}
		}

	fmt.Println("lev2")

```

- array

```golang
    var a [4]int
    fmt.Println(a)  //[0,0,0,0]

 	a:=[2]int{1,2}
	fmt.Println(a) // [1,2]

	a:=[5]int{19,2}
	fmt.Println(a)  //[19 2 0 0 0]

	 a:=[5]int{4:2}
	fmt.Println(a) //[0 0 0 0 2]

	a:=[...]int{1,2,3,4,5}
	fmt.Println(a)  //[1 2 3 4 5]

	a:=[...]int{0:12,1:13,2:14,3:15}
	fmt.Println(a)  //[12 13 14 15]

	a:=[...]int{10:12,11:13,9:14,8:15,1:2}
	fmt.Println(a)   //[0 2 0 0 0 0 0 0 15 14 12 13]


	//数组指针  *指针  指向数组得指针
	a:=[...]int{9:5}

	var p *[10]int = &a

	fmt.Println(p)  //&[0 0 0 0 0 0 0 0 0 5]


	//指针数组
	x,y := 1,2

 	a := [...]*int{&x,&y}

 	fmt.Println(a)  //[0xc042052080 0xc042052088]


 	//数组可以用 == / != 比较
 	a:=[...]int{9:5}

	b:=[...]int{9:5}

	fmt.Println(a==b)


	a:= [5]int{}

	a[1] = 2
	fmt.Println(a) //[0 2 0 0 0]


	b:=new([5]int)
	b[1] = 2

	fmt.Println(b) //&[0 2 0 0 0]  指向数组得指针


    //二位数组  //最后两个括号贴在一起
	a:= [2][3]int {
		{1,2,3},
		{4,5,6}}
	fmt.Println(a)  //[[1 2 3] [4 5 6]]




	//冒泡排序
	arr := []int{12, 32, 12, 1, 2, 0, 3, 21, 34}

	b := len(arr)

	for i := 0; i < b ; i++ {
		for j:=i+1;j<b ;j++  {
			if arr[i] < arr[j]{
				temp :=arr[i]
				arr[i] = arr[j]
				arr[j] = temp
			}
		}
	}

	fmt.Println(arr)

```

- slice  切片

```golang

    arr := []byte{'a','b','c','d','e','f','g'}
	fmt.Println(string(arr[2:7]))  //cdefg

    // slice 得创建 长度40 沾满3个，成倍往上涨
	s1 := make([]int,3,10)


    fmt.Println(len(s1))  //3   长度
	fmt.Println(cap(s1))  //10  容量

	//Reslice

	// append(arr,ele...)


	//cpoy
	arr :=[]int{1,3,4}
	arr1 := []int{5,6,7,8,9}
	copy(arr1,arr)
	fmt.Println(arr1)  //1,3,4,7,8,9
```

- map

```golang


var m map[int]string
m = make(map[int]string)
fmt.Println(m)


	m := make(map[int]string)
	m[1] = "ok"
	fmt.Println(m)   //map[1:ok]

	fmt.Println(m[1])  //ok


	        // key type    value type
	var m map[int]map[int]string
	m = make(map[int]map[int]string)

	a, ok := m[2][1]

	if !ok {
		m[2] = make(map[int]string)
	}

	m[2][1] = "good"

	a = m[2][1]

	fmt.Println(a,ok)

        // range 迭代
	sm := make([]map[int]string,5)

	for k:=range sm{
		sm[k] = make(map[int]string,1)
		sm[k][1] = "ele"
		fmt.Println(sm[k])
		fmt.Println(sm[k])
	}

	fmt.Println(sm)

/*
map[1:ele]
map[1:ele]
map[1:ele]
map[1:ele]
map[1:ele]
map[1:ele]
map[1:ele]
map[1:ele]
map[1:ele]
map[1:ele]
[map[1:ele] map[1:ele] map[1:ele] map[1:ele] map[1:ele]]



    */

    //map key sort

	m := map[int]string{1: "a", 2: "b", 3: "c", 4: "d"}

	arr := make([]int,len(m))
	i := 0
	for key , _ := range m {
		arr[i] = key
		i++
	}

	sort.Ints(arr)
	fmt.Println(arr)

	//val = key

	m := map[int]string{1: "a", 2: "b", 3: "c", 4: "d"}

	m1 := make(map[string]int,len(m))

	for key, value := range m {
		m1[value] = key
	}

	fmt.Println(m1)


```

- func


```golang

    //匿名函数
	a := func() {
		fmt.Println("name")

	}
	a()

// 闭包

func main() {

	f := closure(9)

	fmt.Println(f(10))  //19
	fmt.Println(f(15))  //24

	}

func closure(x int) func(int) int  {
	return func(i int) int {
		return x + i
	}
}

```

- defer 的执行方式类似其他语言中的析构函数，在函数体执行结束后，按照调用顺序的相反顺序逐个执行


```golang

for i := 0; i < 5; i++ {
		defer fmt.Println(i)  //4 3 2 1 0
	}



	// Go 没有一场机制，但有panic/recover 模式来处理错误
	// painic 可以在任何地方引发，但recover 只有在defer 调用的函数中有效
func main() {

	a()
	b()
	c()

}

func a() {
	fmt.Println("func a")
}

func b() {
	defer func() {   // 不加这段代码，就会终止执行
		if err := recover(); err != nil {
			fmt.Println("recover in b")

		}
	}()
	panic("panic in b")  //
}

func c()  {
	fmt.Println(" func  c")
}


/*执行结果如何？*/

var fs = [4]func()(){}

	for i:=0; i<4;i++  {
		defer fmt.Println("defer i = ", i)
		defer func() {fmt.Println("defer closure i = ",i)}()

		fs[i] = func() {
			fmt.Println("closure i = ",i)
		}
	}

	for _,f:=range fs{
		f()
	}


/*

closure i =  4
closure i =  4
closure i =  4
closure i =  4
defer closure i =  4
defer i =  3
defer closure i =  4
defer i =  2
defer closure i =  4
defer i =  1
defer closure i =  4
defer i =  0

*/
```

- struct

```golang

type person struct {
	age int
	name string
}


func main() {

    /*
    a := person{}
	a.name = "cc"
	a.age = 19
    */

	a := person{
		age :19,
		name : "cc",
	}

	fmt.Println(a) //{19 cc}
    fmt.Println(a.name) //cc

}

//值拷贝的方式传递

func main() {

	a := person{}
	a.name = "cc"
	a.age = 19
	fmt.Println(a)
	f(a)
	fmt.Println(a)
}

func f (per person){
	per.age =22
	per.name = "jj"

	fmt.Println(per)
}


//指针传递
func main() {

	a := person{}
	a.name = "cc"
	a.age = 19
	fmt.Println(a)
	f(&a)
	fmt.Println(a)
}

func f (per *person){
	per.age =22
	per.name = "jj"

	fmt.Println(per)
}


//结构嵌套，匿名

type person struct {
	age int
	name string

	conent struct {
		phone,city string
	}
}


func main() {
	a := person{
		age:19,
		name:"ll",
	}

	a.conent.phone  = "ip"
	a.conent.city  = "shen"
	fmt.Println(a)
}


//结构嵌套 有名
type info struct {
	phone,city string
}

type person struct {
	age int
	name string

	conent info
}


func main() {
	a := person{
		age:19,
		name:"ll",

		conent: info{
			city:"s",
			phone:"cc",
		},
	}

	fmt.Println(a)
}

//相同的类型 可以进行比较，不通类型不能进行比较

a := person {name:"mm",age:10}

b := person {name:"mm",age:10}

a == b //true

```
- struct 中的 method

```golang


type person struct {
	name string
}


func main() {
	a := person {name:"ll"}
	a.print()
	fmt.Println(a)
}

func (a person)print()  {
	fmt.Println("this is a in person")
}


// 内置类型

type in int

func main() {
	var a in

	a.aprint()
}

func (a *in) aprint()  {
	fmt.Println("aa")
}


// 参数传递

import "fmt"

type in int

func main() {
	var a in

	a.aprint(100)

	fmt.Println(a)
}

func (a *in) aprint(num int)  {
	*a +=in(num)
}

```

- interface 接口的简单实现


```golang

package main

import "fmt"

type usb interface {
	Name() string
	connect()
}

type phoneConnecter struct {
	name string
}

func (pc phoneConnecter) Name() string  {
	return pc.name
}

func (pc phoneConnecter) connect()  {
	fmt.Println("connect>>>",pc.name)
}

func Disconnect(u usb)  {

}

func main() {

	var a phoneConnecter
	a.name = "com"

	a.connect()
}



// 案列二

package main

import "fmt"

type usb interface {
	Name() string
	connect()
}

type phoneConnecter struct {
	name string
}

func (pc phoneConnecter) Name() string  {
	return pc.name
}

func (pc phoneConnecter) connect()  {
	fmt.Println("connect>>>",pc.name)
}

func Disconnect(u usb)  {

	if pc,ok := u.(phoneConnecter); ok {

		fmt.Println("Disconnect>>",pc.name)
		return
	}

	fmt.Println("Unknown device")
}

func main() {

	var a phoneConnecter
	a.name = "com"

	a.connect()
	Disconnect(a)
}


```

- reflect 反射，反射 接口 字段，字段类型，值，方法

```golang

package main

import (
	"fmt"
	"reflect"
)

type User struct {
	Id   int
	Name string
	Age  int
}

func (a User) Hello() {
	fmt.Println("hellow word")
}

func main() {
	u := User{1,"ok",12}

	Info(u)
}

func Info(o interface{}) {
	t := reflect.TypeOf(o)
	fmt.Println("tyepe:", t.Name())

	v := reflect.ValueOf(o)

	fmt.Println("field:")

	for  i:=0; i<t.NumField();i++  {
		f :=t.Field(i)
		val := v.Field(i).Interface()

		fmt.Printf("%6s:%v = %v\n",f.Name,f.Type,val)
	}

	for i :=0; i< t.NumMethod();i++  {
		m := t.Method(i)
		fmt.Printf("%6s: %v\n",m.Name,m.Type)
	}
}


//反射修改值


package main

import (
	"fmt"
	"reflect"
)

type User struct {
	Id int
	Name string
	Age int
}

func main() {
	u := User{1,"ok",12}

	Set(&u)

	fmt.Println(u)
}

func Set(o interface{})  {
	v := reflect.ValueOf(o)

	if v.Kind() == reflect.Ptr && !v.Elem().CanSet(){
		fmt.Println("XXX")
		return
	} else {
		v = v.Elem()
	}

	f:=v.FieldByName("Name")  //查询Name字段

	if !f.IsValid() {  // f值是否有效
		fmt.Println("BAD")
	}

	if f.Kind() ==reflect.String {  // f值是否是string 类型
		f.SetString("32")
	}
}

// 如何通过反射调用方法

package main

import (
	"fmt"
	"reflect"
)

type User struct {
	Id   int
	Name string
	Age  int
}

func (p User) Hello(str string) {
	fmt.Println("helo", str, "my name is", p.Name)

}

func main() {
	u := User{1, "ok", 12}

	v := reflect.ValueOf(u)

	mv := v.MethodByName("Hello")

	args := []reflect.Value{reflect.ValueOf("ok")}

	mv.Call(args)  //helo ok my name is ok
}


```
 - channel
 ```

 // example 1


 func main() {
	c := make(chan bool)

	go func() {
		fmt.Println("gogogo")
		c <- true  //存值
	}()
	<-c  //取值
}


 // example 2

 package main

import "fmt"

var c chan string

func Pingpong()  {
	i :=0
	for {
		fmt.Println(<-c)
		c <- fmt.Sprintf("from pingpong hi #%d",i)
	}
}

func main() {
	c = make(chan string)

	go Pingpong()

	for i:=0;i<10 ;i++  {
		c <- fmt.Sprintf("from main hi #%d",i)
		fmt.Println(<-c)
	}
}
 ```




