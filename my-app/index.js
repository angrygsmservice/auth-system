require("dotenv").config();

const http = require("http");

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true"
};

const crypto = require("crypto");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log("EMAIL XATO:", error.message);
  } else {
    console.log("EMAIL SERVER ISHLAYAPTI!");
  }
});

const mongoClient = new MongoClient("mongodb://127.0.0.1:27017");

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

async function startServer() {
  try {
    // MongoDB ulanish
    await mongoClient.connect();
    console.log("MongoDB ga ulandi!");

    const db = mongoClient.db("auth_system");
    const users = db.collection("users");

    // SERVER
    const server = http.createServer(async (req, res) => {

      Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      // =========================
      // HOME
      // =========================
      if (req.url === "/" && req.method === "GET") {
        res.writeHead(200, {
          "Content-Type": "text/plain; charset=utf-8"
        });

        res.end("Bosh sahifa ishlayapti!");
        return;
      }

      // =========================
      // TEST
      // =========================
      if (req.url === "/test" && req.method === "GET") {
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8"
        });

        res.end(JSON.stringify({
          success: true,
          message: "Test ishladi!"
        }));

        return;
      }

      // =========================
      // DB TEST
      // =========================
      if (req.url === "/db-test" && req.method === "GET") {
        try {
          await db.command({ ping: 1 });

          res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8"
          });

          res.end(JSON.stringify({
            success: true,
            message: "MongoDB ishlayapti!"
          }));

        } catch (error) {
          console.log("DB TEST XATO:", error);

          res.writeHead(500, {
            "Content-Type": "application/json; charset=utf-8"
          });

          res.end(JSON.stringify({
            success: false,
            message: error.message
          }));
        }

        return;
      }

      // =========================
      // REGISTER
      // =========================
      if (req.url === "/register" && req.method === "POST") {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            console.log("REGISTER BODY:", body);

            const data = JSON.parse(body);

            const { username, password } = data;

            // Username va password tekshirish
            if (!username || !password) {
              res.writeHead(400, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "Username va password kerak!"
              }));

              return;
            }

            // Username uzunligi
            if (username.length < 3) {
              res.writeHead(400, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "Username kamida 3 ta belgidan iborat bo'lishi kerak!"
              }));

              return;
            }

            // Password uzunligi
            if (!isStrongPassword(password)) {
              res.writeHead(400, {
               "Content-Type": "application/json; charset=utf-8"
             });

             res.end(JSON.stringify({
               success: false,
               message: "Password kamida 8 ta belgi, katta harf, kichik harf va raqamdan iborat bo'lishi kerak!"
             }));

             return;
           }

            // User mavjudligini tekshirish
            const existingUser = await users.findOne({
              username: username
            });

            if (existingUser) {
              res.writeHead(409, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "Bu username band!"
              }));

              return;
            }

            // Password hash
            const hashedPassword = await bcrypt.hash(password, 10);

            // User yaratish
            const result = await users.insertOne({
              username: username,
              password: hashedPassword,
              refreshToken: null,
              createdAt: new Date()
            });

            console.log("USER YARATILDI:", result.insertedId);

            res.writeHead(201, {
              "Content-Type": "application/json; charset=utf-8"
            });

            res.end(JSON.stringify({
              success: true,
              message: "User muvaffaqiyatli yaratildi!",
              userId: result.insertedId
            }));

          } catch (error) {
            console.log("REGISTER XATO:", error);

            res.writeHead(500, {
              "Content-Type": "application/json; charset=utf-8"
            });

            res.end(JSON.stringify({
              success: false,
              message: error.message
            }));
          }
        });

        return;
      }

      // =========================
      // REFRESH TOKEN
      // =========================
      if (req.url === "/refresh" && req.method === "POST") {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            const { refreshToken } = JSON.parse(body);

            // Refresh token yuborilganmi?
            if (!refreshToken) {
              res.writeHead(401, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "Refresh token kerak!"
              }));

              return;
            }

            // Refresh tokenni tekshirish
            const decoded = jwt.verify(
              refreshToken,
              REFRESH_TOKEN_SECRET
            );

            // MongoDB'dan userni topish
            const user = await users.findOne({
              _id: new (require("mongodb").ObjectId)(decoded.userId),
              refreshToken: refreshToken
            });

            if (!user) {
              res.writeHead(401, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "Refresh token noto'g'ri!"
              }));

              return;
            }

            // Yangi Access Token
            const newToken = jwt.sign(
              {
                userId: user._id.toString(),
                username: user.username
              },
              JWT_SECRET,
              {
                expiresIn: "1h"
              }
            );

            // Yangi Refresh Token
            const newRefreshToken = jwt.sign(
              {
               userId: user._id.toString()
              },
              REFRESH_TOKEN_SECRET,
              {
               expiresIn: "7d"
              }
            );

            // Eski Refresh Tokenni yangi token bilan almashtirish
            await users.updateOne(
              {
                _id: user._id,
                refreshToken: refreshToken
              },
              {
                $set: {
                  refreshToken: newRefreshToken
                }
              }
            );

            res.writeHead(200, {
              "Content-Type": "application/json; charset=utf-8"
            });

            res.end(JSON.stringify({
              success: true,
              message: "Yangi access token yaratildi!",
              token: newToken,
              refreshToken: newRefreshToken
            }));

          } catch (error) {
            console.log("REFRESH XATO:", error);

            res.writeHead(401, {
              "Content-Type": "application/json; charset=utf-8"
            });

            res.end(JSON.stringify({
              success: false,
              message: "Refresh token noto'g'ri yoki muddati tugagan!"
            }));
          }
        });

        return;
      }

      // =========================
      // LOGOUT
      // =========================
      if (req.url === "/logout" && req.method === "POST") {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            const { refreshToken } = JSON.parse(body);

            if (!refreshToken) {
              res.writeHead(400, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "Refresh token kerak!"
              }));

              return;
            }

            // Refresh tokenni MongoDB'dan o'chirish
            const result = await users.updateOne(
              {
                refreshToken: refreshToken
              },
              {
                $set: {
                  refreshToken: null
                }
              }
            );

            if (result.matchedCount === 0) {
              res.writeHead(401, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "Refresh token topilmadi!"
              }));

              return;
            }

            res.writeHead(200, {
              "Content-Type": "application/json; charset=utf-8"
            });

            res.end(JSON.stringify({
              success: true,
              message: "Logout muvaffaqiyatli!"
            }));

          } catch (error) {
            console.log("LOGOUT XATO:", error);

            res.writeHead(500, {
              "Content-Type": "application/json; charset=utf-8"
            });

            res.end(JSON.stringify({
              success: false,
              message: error.message
           }));
          }
         });

        return;
      }

      // =========================
      // CHANGE PASSWORD
      // =========================
      if (req.url === "/change-password" && req.method === "POST") {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            // =========================
            // TOKENNI OLISH
            // =========================
            const authHeader = req.headers.authorization;

            if (!authHeader) {
              res.writeHead(401, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "Token kerak!"
              }));

              return;
            }

            const token = authHeader.split(" ")[1];

            // =========================
            // TOKENNI TEKSHIRISH
            // =========================
            const decoded = jwt.verify(
              token,
              JWT_SECRET
            );

            // =========================
            // BODY
            // =========================
            const {
              oldPassword,
              newPassword
            } = JSON.parse(body);

            if (!oldPassword || !newPassword) {
              res.writeHead(400, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "Eski va yangi password kerak!"
              }));

              return;
            }

            // Yangi password uzunligi
            if (!isStrongPassword(newPassword)) {
              res.writeHead(400, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "Yangi password kamida 8 ta belgi, katta harf, kichik harf va raqamdan iborat bo'lishi kerak!"
              }));

              return;
            }

            // =========================
            // USERNI TOPISH
            // =========================
            const { ObjectId } = require("mongodb");

            const user = await users.findOne({
              _id: new ObjectId(decoded.userId)
            });

            if (!user) {
              res.writeHead(404, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "User topilmadi!"
              }));

              return;
            }

            // =========================
            // ESKI PASSWORDNI TEKSHIRISH
            // =========================
            const oldPasswordMatch = await bcrypt.compare(
              oldPassword,
              user.password
            );

            if (!oldPasswordMatch) {
              res.writeHead(401, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "Eski password noto'g'ri!"
              }));

              return;
            }

            // =========================
            // YANGI PASSWORDNI HASH
            // =========================
            const newHashedPassword = await bcrypt.hash(
              newPassword,
              10
            );

            // =========================
            // MONGODB'DA YANGILASH
            // =========================
            await users.updateOne(
              {
                _id: user._id
              },
              {
                $set: {
                  password: newHashedPassword,
                  updatedAt: new Date(),
                  refreshToken: null
               }
              }
            );

            // =========================
            // JAVOB
            // =========================
            res.writeHead(200, {
              "Content-Type": "application/json; charset=utf-8"
            });

            res.end(JSON.stringify({
              success: true,
              message: "Password muvaffaqiyatli o'zgartirildi!"
            }));

          } catch (error) {
            console.log("CHANGE PASSWORD XATO:", error);

            res.writeHead(401, {
              "Content-Type": "application/json; charset=utf-8"
            });

            res.end(JSON.stringify({
              success: false,
              message: "Token noto'g'ri yoki muddati tugagan!"
            }));
          }
        });

        return;
      }

      // =========================
      // FORGOT PASSWORD
      // =========================
      if (req.url === "/forgot-password" && req.method === "POST") {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            const { username } = JSON.parse(body);

            if (!username) {
              res.writeHead(400, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "Username kerak!"
              }));

              return;
            }

            const user = await users.findOne({
              username: username
            });

            if (!user) {
              res.writeHead(404, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "User topilmadi!"
              }));

              return;
            }

      const resetOTP = crypto
        .randomInt(100000, 1000000)
        .toString();

      const resetOTPExpire = new Date(
        Date.now() + 10 * 60 * 1000
      );

      await users.updateOne(
        {
          _id: user._id
        },
        {
          $set: {
            resetOTP: resetOTP,
            resetOTPExpire: resetOTPExpire,
            resetOTPVerified: false
          }
        }
      );

      // OTP'ni user emailiga yuborish
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "Password reset OTP",
        text: `Sizning password reset OTP kodingiz: ${resetOTP}. Bu kod 10 daqiqa amal qiladi.`
      });

      console.log("RESET OTP EMAILGA YUBORILDI");

      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8"
      });

      res.end(JSON.stringify({
        success: true,
        message: "OTP emailingizga yuborildi!"
      }));

    } catch (error) {
      console.log("FORGOT PASSWORD XATO:", error);

      res.writeHead(500, {
        "Content-Type": "application/json; charset=utf-8"
      });

      res.end(JSON.stringify({
        success: false,
        message: error.message
      }));
    }
  });

  return;
}

      // =========================
      // VERIFY OTP
      // =========================
      if (req.url === "/verify-otp" && req.method === "POST") {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            const { username, otp } = JSON.parse(body);

            if (!username || !otp) {
              res.writeHead(400, {
               "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "Username va OTP kerak!"
              }));

              return;
            }

            // Userni topish
            const user = await users.findOne({
              username: username
            });

            if (!user) {
              res.writeHead(404, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "User topilmadi!"
              }));

              return;
            }

            if (user.resetOTPVerified === true) {
              res.writeHead(401, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "OTP allaqachon tasdiqlangan!"
              }));

              return;
            }

            // OTPni tekshirish
            if (user.resetOTP !== otp) {
              res.writeHead(401, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "OTP noto'g'ri!"
              }));

              return;
            }

            // OTP muddati tugaganmi?
            if (
              !user.resetOTPExpire ||
              new Date() > new Date(user.resetOTPExpire)
            ) {
              res.writeHead(401, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "OTP muddati tugagan!"
              }));

              return;
            }

            const resetToken = crypto.randomBytes(32).toString("hex");
            const resetTokenExpire = new Date(Date.now() + 10 * 60 * 1000);

            await users.updateOne(
              {
                _id: user._id,
                resetOTP: otp
              },
              {
                $set: {
                  resetOTPVerified: true,
                  resetToken: resetToken,
                  resetTokenExpire: resetTokenExpire
                }
              }
            );

            // OTP to'g'ri
            res.writeHead(200, {
              "Content-Type": "application/json; charset=utf-8"
            });

            res.end(JSON.stringify({
              success: true,
              message: "OTP tasdiqlandi!",
              resetToken: resetToken
            }));

          } catch (error) {
            console.log("VERIFY OTP XATO:", error);

            res.writeHead(500, {
              "Content-Type": "application/json; charset=utf-8"
            });

            res.end(JSON.stringify({
              success: false,
              message: error.message
            }));
          }
        });

        return;
      }

      // =========================
      // RESET PASSWORD
      // =========================
      if (req.url === "/reset-password" && req.method === "POST") {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            const {
              username,
              otp,
              resetToken,
              newPassword
            } = JSON.parse(body);

            if (!username || !resetToken || !newPassword) {
              res.writeHead(400, {
                "Content-Type": "application/json; charset=utf-8"
             });

              res.end(JSON.stringify({
                success: false,
                message: "Username, reset token va yangi password kerak!"
              }));

              return;
            }

            if (!isStrongPassword(newPassword)) {
              res.writeHead(400, {
               "Content-Type": "application/json; charset=utf-8"
             });

             res.end(JSON.stringify({
               success: false,
               message: "Yangi password kamida 8 ta belgi, katta harf, kichik harf va raqamdan iborat bo'lishi kerak!"
             }));

             return;
           }

            const user = await users.findOne({
              username: username
            });

            if (!user) {
              res.writeHead(404, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "User topilmadi!"
              }));

              return;
            }

            if (
              user.resetToken !== resetToken ||
              !user.resetTokenExpire ||
              new Date() > new Date(user.resetTokenExpire)
            ) {
              res.writeHead(401, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "Reset token noto'g'ri yoki muddati tugagan!"
              }));

              return;
            }

            if (user.resetOTPVerified !== true) {
              res.writeHead(401, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "OTP avval tasdiqlanishi kerak!"
              }));

              return;
            }

            const hashedPassword = await bcrypt.hash(
              newPassword,
              10
            );

            await users.updateOne(
              {
                _id: user._id
              },
              {
                $set: {
                  password: hashedPassword,
                  updatedAt: new Date(),
                  resetOTP: "",
                  resetOTPExpire: null,
                  resetOTPVerified: false,
                  resetToken: null,
                  resetTokenExpire: null,
                  refreshToken: null
                }
              }
            );

            res.writeHead(200, {
              "Content-Type": "application/json; charset=utf-8"
            });

            res.end(JSON.stringify({
              success: true,
              message: "Password muvaffaqiyatli reset qilindi!"
            }));

          } catch (error) {
            console.log("RESET PASSWORD XATO:", error);

            res.writeHead(500, {
              "Content-Type": "application/json; charset=utf-8"
            });

            res.end(JSON.stringify({
              success: false,
              message: error.message
            }));
          }
        });

        return;
      }

      // =========================
      // LOGIN
      // =========================
      if (
        (req.url === "/login" || req.url === "/api/v1/auth/login") &&
        req.method === "POST"
      ) {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            console.log("LOGIN BODY:", body);

            const { username, password } = JSON.parse(body);

            // Username va password tekshirish
            if (!username || !password) {
              res.writeHead(400, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "Username va password kerak!"
              }));

              return;
            }

            // Userni MongoDB'dan topish
            const user = await users.findOne({
              username: username
            });

            if (!user) {
              res.writeHead(401, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "Username yoki password noto'g'ri!"
              }));

              return;
            }

            // Passwordni tekshirish
            const passwordMatch = await bcrypt.compare(
              password,
              user.password
            );

            if (!passwordMatch) {
              res.writeHead(401, {
                "Content-Type": "application/json; charset=utf-8"
              });

              res.end(JSON.stringify({
                success: false,
                message: "Username yoki password noto'g'ri!"
              }));

              return;
            }

            // =========================
            // ACCESS TOKEN
            // =========================
            const token = jwt.sign(
              {
                userId: user._id.toString(),
                username: user.username
              },
              JWT_SECRET,
              {
                expiresIn: "1h"
              }
            );

            // =========================
            // REFRESH TOKEN
            // =========================
            const refreshToken = jwt.sign(
              {
                userId: user._id.toString()
              },
              REFRESH_TOKEN_SECRET,
              {
                expiresIn: "7d"
              }
            );

            // Refresh tokenni MongoDB'ga saqlash
            await users.updateOne(
              {
                _id: user._id
              },
              {
                $set: {
                  refreshToken: refreshToken
                }
              }
            );

            // Login javobi
            res.writeHead(200, {
              "Content-Type": "application/json; charset=utf-8"
            });

            res.end(JSON.stringify({
              success: true,
              message: "Login muvaffaqiyatli!",
              token: token,
              refreshToken: refreshToken,
              user: {
                id: user._id,
                username: user.username
              }
            }));

          } catch (error) {
            console.log("LOGIN XATO:", error);

            res.writeHead(500, {
              "Content-Type": "application/json; charset=utf-8"
            });

            res.end(JSON.stringify({
              success: false,
              message: error.message
            }));
          }
        });

        return;
      }

      // =========================
      // PROFILE
      // =========================
      if (req.url === "/profile" && req.method === "GET") {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          res.writeHead(401, {
            "Content-Type": "application/json; charset=utf-8"
          });

          res.end(JSON.stringify({
            success: false,
            message: "Authorization Bearer token kerak!"
          }));

          return;
        }

        const token = authHeader.split(" ")[1];

        try {
          const decoded = jwt.verify(
            token,
            JWT_SECRET
          );

          res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8"
          });

          res.end(JSON.stringify({
            success: true,
            message: "Profile ma'lumotlari",
            user: decoded
          }));

        } catch (error) {
          res.writeHead(401, {
            "Content-Type": "application/json; charset=utf-8"
          });

          res.end(JSON.stringify({
            success: false,
            message: "Token noto'g'ri yoki muddati tugagan!"
          }));
        }

        return;
      }

      // =========================
      // ROUTE TOPILMADI
      // =========================
      res.writeHead(404, {
        "Content-Type": "application/json; charset=utf-8"
      });

      res.end(JSON.stringify({
        success: false,
        message: "Route topilmadi"
      }));
    });

    // =========================
    // SERVER START
    // =========================
    server.listen(3000, () => {
      console.log(
        "Server http://localhost:3000 manzilida ishlayapti!"
      );
    });

  } catch (error) {
    console.log("MongoDB XATO:", error.message);
  }
}

function isStrongPassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

startServer();