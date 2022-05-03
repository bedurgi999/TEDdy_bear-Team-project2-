import { BearFootIcon } from "../styles/Style";

import * as React from "react";
import { useState, useContext, useEffect } from "react";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

import LawnCard from "./LawnCard";

function LawnInfo({ dailyList, selectedDate }) {
  console.log(dailyList);
  return (
    <Card item mt={3} mb={3}>
      <Grid item container justifyContent="center" mb={3}>
        <Grid container justifyContent="center" alignItems="center">
          <BearFootIcon src="/bearfooticon.png" alt="Icon of bear's foot" />
          <Typography component="h1" variant="h5" ml={2} mr={2}>
            {selectedDate.slice(0, 4)}년 {selectedDate.slice(4, 6)}월{" "}
            {selectedDate.slice(6, 8)}일의 발자취
          </Typography>
          <BearFootIcon src="/bearfooticon.png" alt="Icon of bear's foot" />
        </Grid>
        {dailyList.length === 0 && (
          <Typography component="h1" variant="h5">
            No history were found.
          </Typography>
        )}
        <Grid container justifyContent="center" alignItems="center">
          {dailyList.map((talk, idx) => (
            <Grid item key={idx} ml={1} mr={1} mt={2}>
              <LawnCard talkId={talk.talkId} idx={idx} />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Card>
  );
}

export default LawnInfo;
