# CPP-class-generator

>Made by: Sergey Balberin, M3101, ITMO

VS code extension that generates class in C++ according to it's description

1. [Installation](#installation)
2. [How to use it](#how-to-use-it)

## Installation
1. Download .vsix file from [Releases](https://github.com/sbilluxion/CPP-class-generator/releases/latest) 
2. Open directory with .vsix file in VS code or drop it into your working directory
3. Click .vsix file with RMB
4. Select "Install extension with VSIX"

## How to use it

1. Enter description and select it:

   ```text
   class Student
   name: str
   age: int
   ```
>[!NOTE]
>   You can enter description in one line : `class Student / name: str / age: int`.

2. Open command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
3. Execute **CPP: Generate Class from Selection**.

Selection will change to:

```cpp
#include <string>

class Student {
public:
    std::string name{};
    int age{};

    const std::string& getName() const {
        return this->name;
    }

    void setName(const std::string& value) {
        this->name = value;
    }

    int getAge() const {
        return this->age;
    }

    void setAge(int value) {
        this->age = value;
    }
};
```

>[!IMPORTANT]
>You can select field's accessibility by typing **public** or **private** after it's name. If you leave field without accesibility parameter it will automatically appear in **public**.

**Supported types**: string, int, float, double, bool, char, short, long, long long, unsigned int



