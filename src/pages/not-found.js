import React from "react";
import Layout from "../components/shared/Layout";
import { Typography } from "@material-ui/core";
import {Link} from "react-router-dom";

function NotFoundPage() {
  return <Layout minimalNavbar title="Page not found" marginTop={100}>
    <Typography variant="h6" align="center" paragraph>
        Sorry, this page isn't available.
    </Typography>
    <Typography variant="h7" align="center" paragraph>
        The link you folowed may be broken, or the page may have been removed.
        {" "}
        <Link to="">
    {""}
      <Typography color="primary" component="span">
          Go back to Socialgram.
      </Typography>
    </Link>
    </Typography>
  </Layout>;
}

export default NotFoundPage;
