const express = require("express");
const app = express();
const db = require("./db");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");
const mw = require("./middleware");
const { s3Url } = require("./config_dev");

const diskStorage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, __dirname + "/uploads");
  },
  filename: function(req, file, callback) {
    uidSafe(24).then(function(uid) {
      callback(null, uid + path.extname(file.originalname));
    });
  }
});

const uploader = multer({
  storage: diskStorage,
  limits: {
    fileSize: 2097152
  }
});

app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(express.json());

app.use(express.static("./public"));

app.get("/images", (req, res) => {
  db.getImages()
    .then(({ rows }) => {
      res.json(rows);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/more-images/:oldestId", (req, res) => {
  const { oldestId } = req.params;
  db.getMoreImages(oldestId)
    .then(({ rows }) => {
      res.json(rows);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/more-images/:oldestIdForTag/tags/:tagId", (req, res) => {
  const { oldestIdForTag, tagId } = req.params;
  db.getMoreImagesByTag(oldestIdForTag, tagId)
    .then(({ rows }) => {
      res.json(rows);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/images/:imageId", mw.requireNumber, (req, res) => {
  const { imageId } = req.params;
  db.getImage(imageId)
    .then(({ rows }) => {
      res.json(rows);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/count-images", (req, res) => {
  db.countImages()
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/tag/:tagId", (req, res) => {
  const { tagId } = req.params;
  db.getTag(tagId)
    .then(({ rows }) => {
      res.json(rows);
    })
    .catch(err => {
      console.log(err);
    });
});

app.post(
  "/upload",
  uploader.single("image"),
  s3.upload,
  mw.formatTags,
  (req, res) => {
    const { username, title, desc, tags } = req.body;
    const { file } = req;
    const url = `${s3Url}${file.filename}`;
    const tagPromises = [];
    let imageId;
    db.addImage(username, title, desc, url)
      .then(({ rows }) => {
        imageId = rows[0].id;
        tags.forEach(tag => {
          tagPromises.push(db.upsertTag(tag, imageId));
        });
        Promise.all(tagPromises)
          .then(result => {
            // console.log(result);
          })
          .catch(err => {
            console.log(err);
          });
        return rows;
      })
      .then(rows => {
        //send image to client
        res.json(rows[0]);
      })
      .catch(err => {
        console.log(err);
        res.sendStatus(500);
      });
  }
);

app.get("/images/:id/comments", (req, res) => {
  const { id: imageId } = req.params;
  db.getComments(imageId)
    .then(({ rows }) => {
      res.json(rows);
    })
    .catch(err => {
      console.log(err);
    });
});

app.post("/images/:id/comments", (req, res) => {
  const { username, comment, imageId } = req.body;
  db.addComment(username, comment, imageId)
    .then(({ rows }) => {
      //send image to client
      res.json(rows[0]);
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    });
});

app.get("/images/:imageId/tags", (req, res) => {
  const { imageId } = req.params;
  db.getTags(imageId)
    .then(({ rows }) => {
      res.json(rows);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/images/tags/:tagId", (req, res) => {
  const { tagId } = req.params;
  db.getImagesByTag(tagId)
    .then(({ rows }) => {
      res.json(rows);
    })
    .catch(err => {
      console.log(err);
    });
});

app.post("/images/:imageId/tags", mw.formatTags, (req, res) => {
  let { tags } = req.body;
  const { imageId } = req.params;
  let tagPromises = [];
  tags.forEach(tag => {
    tagPromises.push(db.upsertTag(tag, imageId));
  });
  Promise.all(tagPromises)
    .then(result => {
      let tags = [];
      //send tags to client
      result.forEach(({ rows }) => {
        tags.push(rows);
      });
      res.json(tags);
    })
    .catch(err => {
      console.log(err);
    });
});

app.post("/images/:imageId/tags/delete", (req, res) => {
  const { imageId } = req.params;
  const { tagId } = req.body;
  db.deleteTagFromImage(imageId, tagId)
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.log(err);
    });
});

if (require.main === module) {
  app.listen(process.env.PORT || 8080, console.log("I'm listening!"));
}
