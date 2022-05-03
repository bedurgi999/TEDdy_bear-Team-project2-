import { User } from '../db'; // from을 폴더(db) 로 설정 시, 디폴트로 index.js 로부터 import함.
import { Ttl } from '../db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { sendMail } from '../utils/email-sender';
import generator from 'generate-password';

class userAuthService {
  static async addUser({
    name,
    email,
    password,
    bearName,
    myTopics,
    infoProvider,
    age,
    sex,
    occupation,
  }) {
    // 이메일 중복 확인
    const user = await User.findByEmail({ email });
    if (user) {
      const errorMessage =
        '이 이메일은 현재 사용중입니다. 다른 이메일을 입력해 주세요.';
      return { errorMessage };
    }

    // id 는 유니크 값 부여
    const id = uuidv4();

    let newUser = {
      id,
      email,
      name,
      bearName,
      myTopics,
      infoProvider,
      age,
      sex,
      occupation,
    };

    if (infoProvider === 'User') {
      // 비밀번호 해쉬화
      const hashedPassword = await bcrypt.hash(password, 10);

      newUser.password = hashedPassword;
    }

    // db에 저장
    const createdNewUser = await User.create({ newUser });
    createdNewUser.errorMessage = null; // 문제 없이 db 저장 완료되었으므로 에러가 없음.

    return createdNewUser;
  }

  static async getUser({ email, password }) {
    // 이메일 db에 존재 여부 확인
    const user = await User.findByEmail({ email });
    if (!user) {
      const errorMessage =
        '해당 이메일은 가입 내역이 없습니다. 다시 한 번 확인해 주세요.';
      return { errorMessage };
    } else if (user.infoProvider === 'Google') {
      return {
        errorMessage:
          '해당 아이디는 기본 로그인 가입 내역이 없습니다. 다시 한 번 확인해 주세요.',
      };
    }

    // 비밀번호 일치 여부 확인
    const correctPasswordHash = user.password;
    const isPasswordCorrect = await bcrypt.compare(
      password,
      correctPasswordHash
    );
    if (!isPasswordCorrect) {
      const errorMessage =
        '비밀번호가 일치하지 않습니다. 다시 한 번 확인해 주세요.';
      return { errorMessage };
    }

    // 반환할 loginuser 객체
    const loginUser = await this.getLoginUserInfoBy(user);

    return loginUser;
  }

  static async getLoginUserInfoBy(user) {
    // 로그인 성공 -> JWT 웹 토큰 생성
    const secretKey = process.env.JWT_SECRET_KEY || 'jwt-secret-key';
    const token = jwt.sign({ user_id: user.id }, secretKey);

    // 반환할 loginuser 객체
    return {
      token,
      id: user.id,
      email: user.email,
      name: user.name,
      bearName: user.bearName,
      level: user.level,
      cotton: user.cotton,
      height: user.height,
      sex: user.sex,
      age: user.age,
      occupation: user.occupation,
      myTopics: user.myTopics,
      infoProvider: user.infoProvider,
      description: user.description,
      exp: user.exp,
      errorMessage: null,
    };
  }

  static async socialLoginBy(token) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const client = new OAuth2Client(clientId);

    // 유효한 idToken인지 확인
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId,
    });

    const { name, email } = ticket.getPayload();

    let user = await User.findByEmail({ email });
    let message = '';

    if (user) {
      // 소셜로그인으로 회원가입한 사용자인 경우
      if (user.infoProvider === 'Google') {
        user = await this.getLoginUserInfoBy(user);
      } else if (user.infoProvider === 'User') {
        // 소셜로그인으로 회원가입한 사용자가 아닌 경우
        return {
          errorMessage:
            '해당 아이디는 소셜로그인 가입 내역이 없습니다. 다시 한 번 확인해 주세요.',
        };
      }
    } else {
      // 새로운 사용자 정보 저장
      user = await this.addUser({
        name: name,
        email: email,
        infoProvider: 'Google',
      });
      user = await this.getLoginUserInfoBy(user);
      message = 'newbie';
    }

    return { message, userInfo: user };
  }

  static async getUsers() {
    const users = await User.findAll();
    return users;
  }

  static async setUser({ user_id, toUpdate }) {
    let user = await User.findById({ user_id });
    if (!user) {
      const errorMessage = '가입 내역이 없습니다. 다시 한 번 확인해 주세요.';
      return { errorMessage };
    }
    if (!toUpdate.name) delete toUpdate.name;
    if (!toUpdate.password || user.infoProvider !== 'User')
      delete toUpdate.password;
    if (!toUpdate.myTopics) delete toUpdate.myTopics;
    if (!toUpdate.bearName) delete toUpdate.bearName;
    if (!toUpdate.sex) delete toUpdate.sex;
    if (!toUpdate.age) delete toUpdate.age;
    if (!toUpdate.occupation) delete toUpdate.occupation;
    if (!toUpdate.description) delete toUpdate.description;
    if (toUpdate.level == null) delete toUpdate.level;
    if (toUpdate.cotton == null) delete toUpdate.cotton;
    if (toUpdate.height == null) delete toUpdate.height;
    if (toUpdate.exp == null) delete toUpdate.exp;

    return await User.updateById({ user_id, toUpdate });
  }

  static async getUserInfo({ user_id }) {
    const user = await User.findById({ user_id });

    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!user) {
      const errorMessage =
        '해당 이메일은 가입 내역이 없습니다. 다시 한 번 확인해 주세요.';
      return { errorMessage };
    }

    return user;
  }

  static async deleteUserAllInfo({ user_id }) {
    const user = await User.findById({ user_id });
    await User.deleteAllById({ user });
    if (!user) {
      const errorMessage =
        '해당 아이디는 가입 내역이 없습니다. 다시 한 번 확인해 주세요.';
      return { errorMessage };
    }
  }

  static async deleteUser({ user_id }) {
    const user = await User.deleteOneUser({ user_id });
    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!user) {
      const errorMessage =
        '해당 아이디는 가입 내역이 없습니다. 다시 한 번 확인해 주세요.';
      return { errorMessage };
    }

    return user;
  }

  // 곰 정보 찾기
  static async getBearInfo({ user_id }) {
    const bearInfo = await User.findBearInfoByUserId({ user_id });

    if (!bearInfo) {
      const errorMessage =
        '해당 아이디는 가입 내역이 없습니다. 다시 한 번 확인해주세요';
      return { errorMessage };
    }
    return bearInfo;
  }

  static async sendMail(email, user_id) {
    const user = await User.findById({ user_id });

    if (!user) {
      const errorMessage =
        '해당 이메일은 가입 내역이 없습니다. 다시 한 번 확인해 주세요.';
      return { errorMessage };
    }

    if (!email) {
      const password = generator.generate({
        length: 8,
        numbers: true,
      });

      const toUpdate = {};
      const hashedPassword = await bcrypt.hash(password, 10);
      toUpdate.password = hashedPassword;

      sendMail(user.email, password);
      return await User.updatePassword({ user_id, toUpdate });
    } else {
      const password = generator.generate({
        length: 6,
        numbers: true,
      });

      const newItem = {};
      newItem.code = password;
      newItem.expireAt = Date.now();

      await Ttl.create({ newItem });

      sendMail(email, password);

      return true;
    }
  }

  static async checkCode(code) {
    const auth = await Ttl.findById({ code });

    if (!auth) {
      const errorMessage = '인증에 실패했습니다.';
      return { errorMessage };
    }

    return true;
  }

  static async updatePassword({ user_id, password }) {
    const toUpdate = {};
    const hashedPassword = await bcrypt.hash(password, 10);
    toUpdate.password = hashedPassword;
    const updatedUser = await User.updatePassword({ user_id, toUpdate });

    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!updatedUser) {
      const errorMessage =
        '해당 이메일은 가입 내역이 없습니다. 다시 한 번 확인해 주세요.';
      return { errorMessage };
    }

    return updatedUser;
  }
}

export { userAuthService };
