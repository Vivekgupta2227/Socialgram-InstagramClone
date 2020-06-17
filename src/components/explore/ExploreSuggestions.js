import React from "react";
import { useExploreSuggestionsStyles } from "../../styles";
import { Hidden, Typography } from "@material-ui/core";
import FollowSuggestions from "../shared/FollowSuggestions";

function ExploreSuggestions() {
  const classes=useExploreSuggestionsStyles();

  return (
    <Hidden xsDown>
      <div className={classes.Container}>
        <Typography 
        color="textSecondary"
        variant="body2"
        component="h2"
        className={classes.Typography} >
          Discover People
        </Typography>
        <FollowSuggestions hideHeader/>
      </div>
    </Hidden>
  );
}

export default ExploreSuggestions;
