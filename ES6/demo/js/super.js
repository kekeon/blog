(function () {
    class Teacher {
        constructor() {
            this.className = 'Teacher'
            this.name = 'Teacher'
        }

        static printStatic() {
            console.log('teacher printStatic')
        }

        getName() {
            console.log('teacher getName')
        }

        show() {
            console.log('Teacher show', this.name)
        }
    }

    class Student extends Teacher {
        constructor() {
            // 子类构造函数必须要调用一次super()，且必须在this使用之前调用。
            super()
            // 调用父类方法
            super.getName()
            this.name = 'Student class'
            console.log(this.className); // Teacher
            console.log(super.className); // undefined, constructor创建的属性是自有属性，不属于原型对象，所以无法打印webName属性值
            super.show()  // Teacher show Student class, super指向父类原型对象，但通过它调用父类原型对象方法时候，方法this指向子类实例
        }


        static Print() {
            // 静态方法中调用父类类静态方法
            super.printStatic()
            console.log('print')
        }

        show() {
            console.log('Student show', this.name)
        }

    }

    let s1 = new Student()
    console.log(s1.className) // Teacher
    Student.Print()

    
    // 在对象字面量中的调用
    let obj1 = {
        method1() {
            console.log("method 1");
        }
    }

    let obj2 = {
        method2() {
            super.method1();
        }
    }

    Object.setPrototypeOf(obj2, obj1);
    //  obj2.__proto__ = obj1， 这两种写法都可以
    obj2.method2(); // logs "method 1"

})()