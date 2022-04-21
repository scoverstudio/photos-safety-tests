const Photo = require("../models/photo.model");
const Voter = require("../models/Voter.model");
const requestIp = require("request-ip");

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {
  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;
    const extension = req.files.file.name;

    if (title && author && email && file) {
      // if fields are not empty...

      const fileExtension = extension.split(".").pop();
      console.log(fileExtension);
      const pattern = new RegExp(
        /(<\s*(strong|em)*>(([A-z]|\s)*)<\s*\/\s*(strong|em)>)|(([A-z]|\s|\.)*)/,
        "g"
      );
      const emailPattern = new RegExp(
        /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/
      );
      const titleMatched = title.match(pattern).join("");
      const emailMatched = email.match(emailPattern).join("");
      if (
        titleMatched.length < title.length ||
        emailMatched.length < email.length
      )
        throw new Error("Invalid characters...");

      if (
        fileExtension === "jpg" ||
        fileExtension === "png" ||
        fileExtension === "gif"
      ) {
        const newPhoto = new Photo({
          title,
          author,
          email,
          src: fileName,
          votes: 0,
        });
        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);
      } else {
        throw new Error("Wrong extension!");
      }
    } else {
      throw new Error("Wrong input!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {
  try {
    res.json(await Photo.find());
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  try {
    const clientIP = requestIp.getClientIp(req);
    const alreadyVoted = await Voter.findOne({
      user: clientIP,
      votes: req.params.id,
    });
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if (alreadyVoted || !photoToUpdate) {
      res.status(500).json(err);
    } else {
      const newVote = new Voter({
        user: clientIP,
        votes: req.params.id,
      });
      photoToUpdate.votes++;
      photoToUpdate.save();
      await newVote.save();
      res.json({ message: "OK", newVote });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
