# Imageboard

The imageboard is a single-page application made with Vue.js, where users can post an image of their choosing along with a title and a textual description, add tags, and leave a comments on other peoples' images.

It uses Amazon Web Services' (AWS) Simple Storage Service (S3) to store the uploaded images.

## Installation

Clone the repository from https://github.com/kimskovhusandersen/Imageboard.git

cd into the directory and run

```
npm install

```

create a PostgreSQL database called "imageboard"

```
psql

create database imageboard;

```

Then configure the petition database by executing the config.sql file from the root directory

```
psql -d imageboard -f sql/config.sql
```

create a new file in the root directory named secrets.json and enter the following:

```
{
    "username": "YOUR_POSTGRESQL_USERNAME",
    "password": "YOUR_POSTGRESQL_PASSWORD",
    "AWS_KEY": "YOUR_AMAZON_KEY",
    "AWS_SECRET": "YOUR_AMAZON_PASSWORD"
}

```

If you haven't created a S3 Bucket already, you'll need to do that.

Then change the URL in the config.json to match the url of your S3 bucket.

```
{
    "s3Url": "https://s3.amazonaws.com/YOUR_BUCKET"
}
```

## Usage

Run Express.js from the directory folder:

```
node .
```

and go to http://localhost:8080

## Contributing

Kim Skovhus Andersen.

The project was developed in cooperation with SPICED Academy.

## License

Copyright (c) 2019 Kim Skovhus Andersen

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
