const multer = require("multer");
const path = require("path");
const crypto = require("crypto");


const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "uploads/avatars/");
  },


  filename: (req, file, cb) => {

    const uniqueName =
      crypto.randomBytes(16).toString("hex") +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }

});



const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp"
  ];


  if (allowedTypes.includes(file.mimetype)) {

    cb(null, true);

  } else {

    cb(
      new Error("Faqat JPG, PNG yoki WEBP formatdagi rasmlar yuklash mumkin"),
      false
    );

  }

};



const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB
  }

});


module.exports = upload;
