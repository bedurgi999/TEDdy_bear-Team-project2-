import * as React from "react";
import Grid from "@mui/material/Grid";

import { BearFootIcon, LawnStyledPage, LawnText } from "../styles/Style";
import LawnCard from "./LawnCard";

function LawnInfo({ dailyList, selectedDate }) {
  return (
    <LawnStyledPage item mt={3} mb={3}>
      <Grid item container justifyContent="center" mb={3}>
        <Grid container justifyContent="center" alignItems="center" mt={2}>
          <BearFootIcon src="/bearfooticon.png" alt="Icon of bear's foot" />
          <LawnText ml={2} mr={2}>
            {selectedDate.slice(0, 4)}년 {selectedDate.slice(4, 6)}월{" "}
            {selectedDate.slice(6, 8)}일의 발자취
          </LawnText>
          <BearFootIcon src="/bearfooticon.png" alt="Icon of bear's foot" />
        </Grid>
        {dailyList.length === 0 && (
          <LawnText mt={2}>시청 기록이 없습니다.</LawnText>
        )}
        <Grid container justifyContent="center" alignItems="center">
          {dailyList.map((talk, idx) => (
            <Grid item key={idx} ml={1} mr={1} mt={2}>
              <LawnCard talkInfo={talk.talkId} idx={idx} />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </LawnStyledPage>
  );
}

export default LawnInfo;
