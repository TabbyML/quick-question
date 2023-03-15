import { useEffect, useState, ReactNode } from "react";

import { useRouter } from "next/router";
import Link from "next/link";

import Container from "@mui/material/Container";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";

import Text from "components/Text";
import Layout from "components/Layout";

import { ProjectInfo, getRepositoryManager } from "services/RepositoryManager";

const HomeContainer = (props: { children: ReactNode }) => (
  <main>
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        {props.children}
      </Container>
    </Layout>
  </main>
);

interface HomeProps {
  projects: ProjectInfo[];
}
export default function Home({ projects }: HomeProps) {
  return (
    <HomeContainer>
      {projects.map((x) => (
        <Row project={x} />
      ))}
    </HomeContainer>
  );
}

interface RowProps {
  project: ProjectInfo;
}

function Row({ project }: RowProps) {
  const label = project.indexingStatus === "success" ? "indexed" : "pending";
  const color = label === "indexed" ? "primary" : "secondary";

  return (
    <Grid
      container
      alignItems="center"
      sx={{
        mt: 1,
        mb: 1,
        border: 1,
        borderColor: "divider",
        pt: 1,
        pb: 1,
        pl: 2,
        pr: 1,
        borderRadius: "5px",
      }}
    >
      <Grid item xs={10} justifyContent="space-between" alignItems="center">
        <Grid item xs={10} sx={{ pl: 2 }}>
          <Link href={"/" + project.metadata.name}>
            <Text type="header" variant="subtitle1">
              {project.metadata.name}
            </Text>
          </Link>
        </Grid>
      </Grid>
      <Grid item xs={2} style={{ textAlign: "right" }}>
        <Chip
          label={label}
          color={color}
          size="medium"
          sx={{ fontSize: "0.9rem", ml: 1 }}
          variant="outlined"
        />
      </Grid>
    </Grid>
  );
}

export async function getServerSideProps(context: any) {
  const server = (context.res.socket as any).server;
  const repository = getRepositoryManager(server);
  return {
    props: {
      projects: repository.collectProjectInfos(),
    },
  };
}
