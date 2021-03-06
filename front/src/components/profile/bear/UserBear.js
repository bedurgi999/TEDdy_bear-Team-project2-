import { BearImg, BearInfo, BearPage, UserPageText } from "../styles/Style";

/** user bear component
 *
 * @param {object} user user data
 * @returns
 */
function UserBear({ user }) {
  return (
    <BearPage>
      <BearImg src="/mybear.png" alt="bear" />
      <BearInfo>
        <UserPageText>LEVEL {user.level}</UserPageText>
        <UserPageText>키 {user.height} cm</UserPageText>
      </BearInfo>
    </BearPage>
  );
}

export default UserBear;
