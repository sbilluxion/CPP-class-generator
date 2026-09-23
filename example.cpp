// class Student
// name: string
// age: int
// averageGrade: double
// isActive: bool


class Student {
private:
    std::string name;
    int age;
    double averageGrade;
    bool isActive;
public:
    Student(
        const std::string& name,
        int age,
        double averageGrade,
        bool isActive
    ) : name(name),
        age(age),
        averageGrade(averageGrade),
        isActive(isActive) {}
    const std::string & getName() const {
        return name;
    }
    void setName(const std::string& name) {
        this->name = name;
    }
    int getAge() const {
        return age;
    }
    void setAge(int age) {
        this->age = age;
    }
};