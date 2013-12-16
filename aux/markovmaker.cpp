#include <iostream>
#include <string>
#include <fstream>

int main(void) {
    using namespace std;
    ifstream file("asteroidlettersonly.txt");
    file.seekg(0, std::ios::end);
    string str;
    str.reserve(file.tellg());
    file.seekg(0, std::ios::beg);
    str.assign((istreambuf_iterator<char>(file)),
            istreambuf_iterator<char>());

    cout << "var freq;" << endl;
    for (int i = 0; i < 2; ++i) {
        char b, e;
        if (i == 0) {
            b = 'A';
            e = 'Z';
        } else {
            b = 'a';
            e = 'z';
        }
        // initial char
        for (char i = b; i <= e; ++i) {
            cout << "freq[\"" << i << "\"] = [";
            int divisor = 0;
            int freq['z'+1];
            fill(freq, freq+'z'+1, 0);
            // get current char
            for (auto c = str.begin(); c+1 != str.end(); ++c) {
                if (*c != i) continue;
                divisor++;
                // frequency of next char
                freq[*(c+1)]++;
            }
            // prevent divide by zero (and no-character names)
            if (divisor == 0) {
                divisor++;
                freq['x']++;
            }
            for (char j = 'A'; j <= 'Z'; ++j) {
                cout << (double)freq[j]/divisor << ", ";
            }
            for (char j = 'a'; j <= 'z'; ++j) {
                cout << (double)freq[j]/divisor << ", ";
            }
            cout << (double)freq['\n']/divisor << "];" << endl;
        }
    }
    return 0;
}
