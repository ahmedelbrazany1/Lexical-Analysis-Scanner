export type TokenType =
  | "IDENTIFIER"
  | "KEYWORD"
  | "NUMBER"
  | "SYMBOL"
  | "MESSAGE"
  | "UNKNOWN";

export interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number; // exclusive
}

export interface ScanStep {
  index: number; // current char position highlighted
  token?: Token; // emitted at this step (if any)
  log: string;
  cppLine?: number; // C++ line to highlight
}

const SYMBOLS = new Set([
  "+",
  "-",
  "*",
  "/",
  "=",
  "(",
  ")",
  "{",
  "}",
  ";",
  ",",
  "<",
  ">",
]);
const KEYWORDS = new Set([
  "bool",
  "char",
  "char8_t",
  "char16_t",
  "char32_t",
  "int",
  "long",
  "short",
  "signed",
  "unsigned",
  "float",
  "double",
  "void",
  "wchar_t",
  "auto",
  "const",
  "static",
  "extern",
  "register",
  "mutable",
  "volatile",
  "thread_local",
  "if",
  "else",
  "switch",
  "case",
  "default",
  "for",
  "while",
  "do",
  "break",
  "continue",
  "goto",
  "return",
  "true",
  "false",
  "nullptr",
  "class",
  "struct",
  "union",
  "enum",
  "friend",
  "this",
  "virtual",
  "explicit",
  "inline",
  "final",
  "override",
  "public",
  "private",
  "protected",
  "template",
  "typename",
  "using",
  "concept",
  "requires",
  "try",
  "catch",
  "throw",
  "noexcept",
  "const_cast",
  "dynamic_cast",
  "reinterpret_cast",
  "static_cast",
  "decltype",
  "typeid",
  "namespace",
  "export",
  "import",
  "module",
  "and",
  "and_eq",
  "or",
  "or_eq",
  "not",
  "not_eq",
  "bitand",
  "bitor",
  "compl",
  "xor",
  "xor_eq",
]);

const isAlpha = (c: string) => /[A-Za-z_]/.test(c);
const isDigit = (c: string) => /[0-9]/.test(c);
const isAlnum = (c: string) => isAlpha(c) || isDigit(c);

const isKeyword = (s: string) => KEYWORDS.has(s);
const isSymbol = (c: string) => SYMBOLS.has(c);

/**
 * Produce a list of incremental scan steps for animation.
 */
export function scanWithSteps(code: string): ScanStep[] {
  const steps: ScanStep[] = [];
  steps.push({ index: -1, log: "> Scanning started...", cppLine: 8 });

  let i = 0;
  while (i < code.length) {
    const c = code[i];

    if (/\s/.test(c)) {
      steps.push({ index: i, log: `> Skip whitespace @${i}`, cppLine: 10 });
      i++;
      continue;
    }

    // MESSAGE: string literal in double quotes
    if (c === '"') {
      const start = i;
      let buf = '"';
      steps.push({ index: i, log: `> Begin string literal`, cppLine: 13 });
      i++;
      while (i < code.length && code[i] !== '"') {
        buf += code[i];
        steps.push({
          index: i,
          log: `> Reading message char '${code[i]}'`,
          cppLine: 14,
        });
        i++;
      }
      if (i < code.length) {
        buf += '"';
        i++;
      }
      steps.push({
        index: i - 1,
        token: { type: "MESSAGE", value: buf, start, end: i },
        log: `> Found MESSAGE: ${buf}`,
        cppLine: 16,
      });
      continue;
    }

    // NUMBER (with optional negative sign)
    const isNegNum =
      c === "-" &&
      isDigit(code[i + 1] ?? "") &&
      // previous non-space char is a symbol or start-of-input
      (() => {
        let k = i - 1;
        while (k >= 0 && /\s/.test(code[k])) k--;
        if (k < 0) return true;
        return isSymbol(code[k]) && code[k] !== ")";
      })();

    if (isDigit(c) || isNegNum) {
      const start = i;
      let buf = "";
      if (isNegNum) {
        buf += "-";
        steps.push({
          index: i,
          log: `> Negative sign for number`,
          cppLine: 21,
        });
        i++;
      }
      while (i < code.length && isDigit(code[i])) {
        buf += code[i];
        steps.push({
          index: i,
          log: `> Reading digit '${code[i]}'`,
          cppLine: 22,
        });
        i++;
      }
      steps.push({
        index: i - 1,
        token: { type: "NUMBER", value: buf, start, end: i },
        log: `> Found NUMBER: ${buf}`,
        cppLine: 24,
      });
      continue;
    }

    // IDENTIFIER / KEYWORD
    if (isAlpha(c)) {
      const start = i;
      let buf = "";
      while (i < code.length && isAlnum(code[i])) {
        buf += code[i];
        steps.push({
          index: i,
          log: `> Reading word char '${code[i]}'`,
          cppLine: 28,
        });
        i++;
      }
      if (isKeyword(buf)) {
        steps.push({
          index: i - 1,
          token: { type: "KEYWORD", value: buf, start, end: i },
          log: `> Found KEYWORD: ${buf}`,
          cppLine: 30,
        });
      } else {
        steps.push({
          index: i - 1,
          token: { type: "IDENTIFIER", value: buf, start, end: i },
          log: `> Found IDENTIFIER: ${buf}`,
          cppLine: 32,
        });
      }
      continue;
    }

    // SYMBOL
    if (isSymbol(c)) {
      steps.push({
        index: i,
        token: { type: "SYMBOL", value: c, start: i, end: i + 1 },
        log: `> Found SYMBOL: ${c}`,
        cppLine: 36,
      });
      i++;
      continue;
    }

    // UNKNOWN
    steps.push({
      index: i,
      token: { type: "UNKNOWN", value: c, start: i, end: i + 1 },
      log: `> UNKNOWN character: ${c}`,
      cppLine: 40,
    });
    i++;
  }

  steps.push({
    index: code.length,
    log: `> Scan complete. Processed ${code.length} characters.`,
    cppLine: 44,
  });
  return steps;
}

export const TOKEN_DESCRIPTIONS: Record<TokenType, string> = {
  IDENTIFIER: "Variable / function name",
  KEYWORD: "Reserved C++ word",
  NUMBER: "Numeric literal",
  SYMBOL: "+ - * / = ( ) { } ;",
  MESSAGE: 'String literal in " "',
  UNKNOWN: "Unrecognized character",
};

export const CPP_SOURCE = `#include <iostream>
#include <string>
#include <cctype>
#include <set>
using namespace std;

bool isKeyword(const string& s) {
    static const set<string> kw = {
        "bool","char","char8_t","char16_t","char32_t",
        "int","long","short","signed","unsigned",
        "float","double","void","wchar_t","auto",
        "const","static","extern","register","mutable",
        "volatile","thread_local","if","else","switch",
        "case","default","for","while","do",
        "break","continue","goto","return","true",
        "false","nullptr","class","struct","union",
        "enum","friend","this","virtual","explicit",
        "inline","final","override","public","private",
        "protected","template","typename","using","concept",
        "requires","try","catch","throw","noexcept",
        "const_cast","dynamic_cast","reinterpret_cast","static_cast","decltype",
        "typeid","namespace","export","import","module",
        "and","and_eq","or","or_eq","not",
        "not_eq","bitand","bitor","compl","xor","xor_eq"
    };

    return kw.count(s) > 0;
}

bool isSymbol(char c) {
    return string("+-*/=(){};,<>").find(c) != string::npos;
}

void scanCode(const string& code) {
    size_t i = 0;

    while (i < code.size()) {
        char c = code[i];

        if (isspace(static_cast<unsigned char>(c))) {
            i++;
            continue;
        }

        if (c == '"') {
            string msg;
            msg += code[i++];

            while (i < code.size() && code[i] != '"') {
                msg += code[i++];
            }

            if (i < code.size()) {
                msg += code[i++];
            }

            cout << "MESSAGE: " << msg << endl;
        }

        else if (
            isdigit(static_cast<unsigned char>(c)) ||
            (c == '-' && i + 1 < code.size() && isdigit(static_cast<unsigned char>(code[i + 1])))
        ) {
            string num;

            if (c == '-') {
                num += code[i++];
            }

            while (i < code.size() && isdigit(static_cast<unsigned char>(code[i]))) {
                num += code[i++];
            }

            cout << "NUMBER: " << num << endl;
        }

        else if (isalpha(static_cast<unsigned char>(c)) || c == '_') {
            string word;

            while (
                i < code.size() &&
                (isalnum(static_cast<unsigned char>(code[i])) || code[i] == '_')
            ) {
                word += code[i++];
            }

            if (isKeyword(word))
                cout << "KEYWORD: " << word << endl;
            else
                cout << "IDENTIFIER: " << word << endl;
        }

        else if (isSymbol(c)) {
            cout << "SYMBOL: " << c << endl;
            i++;
        }

        else {
            cout << "UNKNOWN: " << c << endl;
            i++;
        }
    }

    cout << "Scan complete." << endl;
}

int main() {
    string code = R"(int x = -10; cout << "Hello";)";

    scanCode(code);

    return 0;
}`;
