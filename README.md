## UCSD Undergraduate Economics Society Advertisement Targetting

This small Node.js application was created with the intent of improving UCSD Undergraduate Economics Society's (UES) marketing and advertising. The marketing committee was previously approaching advertising and flyering without data or reason to support their methodology. Hopefully, this application will reduce inefficiency and waste, and increase the effectiveness of the team's efforts.

After fetching real-time course data, the application delivers an easy-to-understand, interactive heatmap of the UCSD campus with classrooms and lecture halls highlighted by students enrolled and students possibly enrolled (waitlisted and open seats). On the sidebar is a list of classrooms and their potential flow of students per week. Obviously, the marketing team should focus their advertisements on these highly populated classrooms.

![Operational Screenshot](/UES%20Ad%20Targeting.png?raw=true "Operational Screenshot")

## Installation

Setup requires <code>Node.js</code>, <code>express</code>, <code>socket.io</code>, and <code>socsjs</code> (additionally, <code>winston</code> is used to logging). Within <code>index.js</code>, variables may be altered to choose which year, quarter, and department should be targetted. At this moment, classrooms must be located manually and hard-coded into the program.

## API Reference

Special thanks to papernotes for publishing [socsjs](https://github.com/papernotes/socsjs), a scraper that simulates and API for UCSD's Schedule of Classes.

## Contributors

Built by myself ([@alex005](https://github.com/Alex005))

## To-do

- [ ] Optimize and review code
- [x] Migrate location coordinates into a separate file
- [x] Clean coordinates and add more buildings
- [ ] Append student num to the clicked building
- [ ] Click should prioritize the most student filled building

## License

MIT License

Copyright (c) 2016 Alex Liebscher

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
