// Supported description types and their C++ equivalents.
export const cppTypes: ReadonlyMap<string, string> = new Map([
    ['string', 'std::string'],
    ['std::string', 'std::string'],
    ['int', 'int'],
    ['float', 'float'],
    ['double', 'double'],
    ['bool', 'bool'],
    ['char', 'char'],
    ['short', 'short'],
    ['long', 'long'],
    ['long long', 'long long'],
    ['unsigned int', 'unsigned int'],
]);

const keywords = new Set(`alignas alignof and and_eq asm atomic_cancel atomic_commit
atomic_noexcept auto bitand bitor bool break case catch char char8_t char16_t
char32_t class compl concept const consteval constexpr constinit const_cast
continue co_await co_return co_yield decltype default delete do double dynamic_cast
else enum explicit export extern false float for friend goto if inline int long
mutable namespace new noexcept not not_eq nullptr operator or or_eq private
protected public reflexpr register reinterpret_cast requires return short signed
sizeof static static_assert static_cast struct switch synchronized template this
thread_local throw true try typedef typeid typename union unsigned using virtual
void volatile wchar_t while xor xor_eq`.split(/\s+/));

export function isCppIdentifier(name: string): boolean {
    return /^[A-Za-z][A-Za-z0-9_]*$/.test(name)
        && !name.includes('__') && !keywords.has(name);
}
