-- start the server:
-- "sudo service postgresql start"

-- To config the database:
-- "psql -d imageboard -f sql/config.sql"

-- To select database:
-- \c testdb

DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS comments;

CREATE TABLE images(
    id SERIAL PRIMARY KEY,
    url VARCHAR(300) NOT NULL,
    username VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    comment TEXT NOT NULL,
    username VARCHAR(255) NOT NULL,
    image_id INT NOT NULL REFERENCES images(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO images (url, username, title, description) VALUES (
    'https://s3.amazonaws.com/spicedling/jAVZmnxnZ-U95ap2-PLliFFF7TO0KqZm.jpg',
    'funkychicken',
    'Welcome to Berlin and the future!',
    'This photo brings back so many great memories.'
);

INSERT INTO images (url, username, title, description) VALUES (
    'https://s3.amazonaws.com/spicedling/wg8d94G_HrWdq7bU_2wT6Y6F3zrX-kej.jpg',
    'discoduck',
    'Elvis',
    'We can''t go on together with suspicious minds.'
);

INSERT INTO images (url, username, title, description) VALUES (
    'https://s3.amazonaws.com/spicedling/XCv4AwJdm6QuzjenFPKJocpipRNNMwze.jpg',
    'discoduck',
    'Hello Berlin',
    'This is going to be worth a lot of money one day.'
);

INSERT INTO comments (comment, username, image_id) VALUES (
    'This is funky!',
    'Arnold',
    1
);

INSERT INTO comments (comment, username, image_id) VALUES (
    'Disco time!!',
    'Donald',
    2
);

INSERT INTO comments (comment, username, image_id) VALUES (
    'Wow, looks great!',
    'Bonbon',
    3
);
