import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import { brown } from "@mui/material/colors";
import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";

import { AlertSwitch, EachEdit, EditPage, EditText } from "./styles/Style";
import { DispatchContext, UserStateContext } from "../../App";
import { MySelect } from "../common/MySelect";
import { MyInput } from "../common/MyInput";
import { MyButton } from "../common/MyButton";
import * as Api from "../../api";

/** edit profile component
 *
 * @returns {component} edit profile page
 */
function EditProfile() {
  const dispatch = useContext(DispatchContext);
  const userState = useContext(UserStateContext);
  const navigate = useNavigate();
  const [editUser, setEditUser] = useState([]);
  const [userTopics, setUserTopics] = useState([]);
  const [checked, setChecked] = useState(userState.user.alert);
  const [modifyPassword, setModifyPassword] = useState("");
  const [file, setFile] = useState(null);
  const [tempUrl, setTempUrl] = useState(
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  );
  useEffect(() => {
    try {
      const getUserData = async () => {
        const res = await Api.get(`users`, userState.user.id);
        setChecked(res.data.alert);
        setEditUser(res.data);
        setUserTopics(res.data.myTopics.map((topic) => topicDict2[topic]));
        setTempUrl(res.data.profileUrl);
      };
      getUserData();
    } catch (err) {
      console.log("Error: award list get request fail", err);
    }
  }, [userState.user.id]);

  const fileInput = useRef(null);

  const handleUpload = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setTempUrl(URL.createObjectURL(e.target.files[0]));
    } else {
      //업로드 취소할 시
      setTempUrl(
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
      );
      return;
    }
  };

  const topTopics = [
    "기술",
    "과학",
    "문화",
    "글로벌이슈",
    "사회",
    "디자인",
    "사회변화",
    "비즈니스",
    "애니메이션",
    "건강",
  ];
  const ages = [
    "나이를 선택해주세요",
    "10대",
    "20대",
    "30대",
    "40대",
    "50대",
    "60대",
  ];

  const topicDict = {
    기술: "technology",
    과학: "science",
    문화: "culture",
    글로벌이슈: "globalissues",
    사회: "society",
    디자인: "design",
    사회변화: "socialchange",
    비즈니스: "business",
    애니메이션: "animation",
    건강: "health",
  };

  const topicDict2 = {
    technology: "기술",
    science: "과학",
    culture: "문화",
    globalissues: "글로벌이슈",
    society: "사회",
    design: "디자인",
    socialchange: "사회변화",
    business: "비즈니스",
    animation: "애니메이션",
    health: "건강",
  };

  const sexs = ["남자", "여자"];

  //Click OK button, edit user data
  const saveEdit = async (e) => {
    e.preventDefault();
    //Put request to update edited user data
    const formD = new FormData();
    formD.append("img", file);

    try {
      await Api.postImg("user/img", formD);
      console.log("이미지 전송에 성공했습니다.");
    } catch (err) {
      console.log("이미지 전송에 실패했습니다.", err);
    }

    try {
      const res = await Api.put(`users/${editUser.id}`, {
        name: editUser.name,
        bearName: editUser.bearName,
        description: editUser.description,
        age: editUser.age !== "나이를 선택해주세요" && editUser.age,
        occupation: editUser.occupation,
        sex: editUser.sex,
        myTopics: userTopics.map((topic) => topicDict[topic]),
        alert: String(checked),
      });
      setEditUser(res.data);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: res.data,
      });
      alert("저장되었습니다!");
      navigate(`/users/${userState.user.id}`);
    } catch (err) {
      console.log("Error: user data put request fail", err);
    }
  };

  const updateData = (e) => {
    setEditUser((cur) => ({
      ...cur,
      [e.target.name]: e.target.value,
    }));
  };

  const onChangePW = (e) => {
    setModifyPassword(e.target.value);
  };

  const handleModifyPW = () => {
    const data = {
      id: userState.user.id,
      password: modifyPassword,
    };
    Api.post("user/update/password", data).then((res) => console.log(res.data));
    setModifyPassword("");
    alert("비밀번호 변경 완료");
  };

  return (
    <EditPage>
      <EachEdit>
        <EditText>프로필 사진</EditText>
        <Avatar
          src={tempUrl}
          sx={{ width: 200, height: 200 }}
          onClick={() => {
            fileInput.current.click();
          }}
        />
        <input
          type="file"
          style={{ display: "none" }}
          accept="image/jpg,impge/png,image/jpeg"
          name="profile_img"
          onChange={handleUpload}
          ref={fileInput}
        />
      </EachEdit>
      <EachEdit>
        <EditText>이름</EditText>
        <MyInput value={editUser.name} name="name" onChange={updateData} />
      </EachEdit>
      <EachEdit>
        <EditText>곰 이름</EditText>
        <MyInput
          value={editUser.bearName}
          name="bearName"
          onChange={updateData}
        />
      </EachEdit>
      <EachEdit>
        <EditText>자기소개</EditText>
        <MyInput
          value={editUser.description}
          name="description"
          onChange={updateData}
        />
      </EachEdit>
      <EachEdit>
        <EditText>관심 주제</EditText>
        <Autocomplete
          multiple
          sx={{
            backgroundColor: brown[100],
            width: "500px",
          }}
          id="tags-outlined"
          options={topTopics}
          value={userTopics}
          onChange={(e, newValue) => {
            setUserTopics(newValue);
          }}
          renderInput={(params) => (
            <TextField sx={{ backgroundColor: brown[100] }} {...params} />
          )}
        />
      </EachEdit>
      <EachEdit>
        <EditText>나이</EditText>
        <MySelect name="age" value={editUser.age} onChange={updateData}>
          {ages.map((age, index) => (
            <option key={index} value={age}>
              {age}
            </option>
          ))}
        </MySelect>
      </EachEdit>
      <EachEdit>
        <EditText>직업</EditText>
        <MyInput
          value={editUser.occupation}
          name="occupation"
          onChange={updateData}
        />
      </EachEdit>
      <EachEdit>
        <EditText>성별</EditText>
        <MySelect name="sex" value={editUser.sex} onChange={updateData}>
          {sexs.map((sex, index) => (
            <option key={index} value={sex}>
              {sex}
            </option>
          ))}
        </MySelect>
      </EachEdit>
      <EachEdit>
        <EditText>알람</EditText>
        <div style={{ width: "540px" }}>
          <AlertSwitch
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            inputProps={{ "aria-label": "controlled" }}
          />
        </div>
      </EachEdit>
      {userState.user.infoProvider !== "Google" && (
        <EachEdit>
          <EditText>비밀번호</EditText>
          <MyInput
            type="password"
            value={modifyPassword}
            name="password"
            onChange={onChangePW}
          />
        </EachEdit>
      )}
      <EachEdit>
        <EditText>회원 탈퇴</EditText>
        <div style={{ width: "510px" }}>
          <MyButton style={{ backgroundColor: "#EA541E" }}>회원 탈퇴</MyButton>
          {userState.user.infoProvider !== "Google" && (
            <MyButton
              onClick={handleModifyPW}
              style={{ backgroundColor: "#1e90ff", marginLeft: "35px" }}
            >
              비밀번호 변경
            </MyButton>
          )}
        </div>
      </EachEdit>
      <MyButton onClick={saveEdit}>저장</MyButton>
    </EditPage>
  );
}

export default EditProfile;
