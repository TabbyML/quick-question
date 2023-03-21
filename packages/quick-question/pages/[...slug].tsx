import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/router";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import LoadingButton from "@mui/lab/LoadingButton";
import LaunchIcon from "@mui/icons-material/Launch";

import Text from "components/Text";
import Layout from "components/Layout";

import ReactMarkdown from "react-markdown";

import { ProjectInfo, getRepositoryManager } from "services/RepositoryManager";

interface CodeSnippetMeta {
  source: string;
  language: string;
  score: number;
  summary: string;
  lineNumber: number;
}

interface CodeSnippet {
  pageContent: string;
  metadata: CodeSnippetMeta;
}

interface HomeProps {
  project: ProjectInfo;
}

const HomeContainer = (props: { children: ReactNode }) => (
  <main>
    <Layout>{props.children}</Layout>
  </main>
);

export default function Home({ project }: HomeProps) {
  const { metadata, indexingStatus, indexMetadata } = project;

  const [searchQuery, setSearchQuery] = useState<string>(
    metadata.exampleQueries[0]
  );

  // One of: initial, loading, loaded
  const [status, setStatus] = useState('initial');
  const [matches, setMatches] = useState<CodeSnippet[]>([]);

  const getSearchResults = async () => {
    setStatus('loading');

    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        project: project.metadata.name,
      }),
    });
    const data = await response.json();
    setMatches(data);
    setStatus('loaded');
  };

  const InfoContainer = (props: { children: ReactNode }) => (
    <HomeContainer>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p style={{ textAlign: "left", marginBottom: "10px" }}>
          Selected repo:{" "}
          <a href={`https://github.com/${metadata.name}`}>{metadata.name}</a>
        </p>
        {props.children}
      </div>
    </HomeContainer>
  );

  const router = useRouter();
  useEffect(() => {
    if (indexingStatus !== "failed" && indexingStatus !== "success") {
      const id = setTimeout(() => {
        router.reload();
      }, 20000);
      return () => {
        clearTimeout(id);
      };
    }
  });

  if (indexingStatus === "failed") {
    return (
      <InfoContainer>
        <Alert severity="error" sx={{ mb: 4 }}>
          Indexing job failed, please check server logging for information
        </Alert>
      </InfoContainer>
    );
  }

  if (indexingStatus !== "success") {
    return (
      <InfoContainer>
        <Alert severity="warning" sx={{ mb: 4 }}>
          Repository needs to be indexed before it is able to search it.
          Indexing usually takes less than 5 minutes. Feel free to grab some
          coffee!
        </Alert>
        <LoadingButton loading variant="outlined">
          Indexing
        </LoadingButton>
      </InfoContainer>
    );
  }

  const revision = indexMetadata?.revision || "main";

  return (
    <HomeContainer>
      <Grid
        container
        sx={{
          border: 1,
          borderColor: "divider",
          mt: 2,
          borderRadius: "5px",
        }}
      >
        <Grid item xs={12} sx={{ pl: 4, pr: 4, pt: 4, pb: 4 }}>
          <Grid item xs={12}>
            <Text type="header" variant="subtitle1">
              Ask a question about {project.metadata.name} ...
            </Text>
          </Grid>
          <Grid item xs={12} sx={{ mt: 4 }}>
            <TextField
              id="document_id"
              label=""
              variant="outlined"
              fullWidth
              placeholder={metadata.exampleQueries[0]}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.keyCode === 13) getSearchResults();
              }}
            />
          </Grid>
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Grid container spacing={1}>
              {metadata.exampleQueries.map((x, i) => (
                <Grid item key={i}>
                  <Chip label={x} onClick={() => setSearchQuery(x)} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            textAlign: "right",
            pl: 4,
            pr: 4,
            pt: 2,
            pb: 2,
            bgcolor: "#111",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <LoadingButton
            loading={status === 'loading'}
            variant="outlined"
            onClick={getSearchResults}
          >
            Search
          </LoadingButton>
        </Grid>
      </Grid>
      {status === 'loaded' && <Grid container sx={{ mt: 6 }}>
        <Grid item xs={8} sx={{ mb: 4 }}>
          <Text type="header" variant="h4">
            Top matches
          </Text>
        </Grid>
        {matches.length == 0 && (
          <Grid item xs={12}>
            <div style={{ textAlign: "center" }}> (No matches)</div>
          </Grid>
        )}
        {matches.map((match, it) => (
          <Grid item xs={12} key={it}>
            <Grid container xs={12} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Chip
                  label={match.metadata.source}
                  size="small"
                  color="primary"
                  sx={{ fontSize: "0.9rem", ml: 1, p: 1 }}
                  variant="outlined"
                  clickable
                />
                <Chip
                  label={`Match: ${Math.round(match.metadata.score * 100)}%`}
                  size="small"
                  color={
                    Math.round(match.metadata.score * 100) < 80
                      ? "warning"
                      : "primary"
                  }
                  sx={{ fontSize: "0.85rem", ml: 1, p: 1 }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6} sx={{ textAlign: "right" }}>
                <Chip
                  label="View on Github"
                  color="default"
                  component="a"
                  href={`https://github.com/${metadata.name}/tree/${revision}/${match.metadata.source}#L${match.metadata.lineNumber}`}
                  size="small"
                  sx={{ fontSize: "0.85rem", ml: 1, p: 1 }}
                  variant="outlined"
                  clickable
                  target="_blank"
                  onDelete={() => { }}
                  deleteIcon={<LaunchIcon />}
                />
              </Grid>
            </Grid>
            <Grid item xs={12} key={it} sx={{ mb: 8 }}>
              <Grid item xs={12}>
                <ReactMarkdown className="summary markdown-body">
                  {match.metadata.summary}
                </ReactMarkdown>
              </Grid>
              <Grid item xs={12}>
                <SyntaxHighlighter
                  language={match.metadata.language}
                  style={atomDark}
                  customStyle={{ color: "red" }}
                  startingLineNumber={match.metadata.lineNumber}
                  showLineNumbers
                  wrapLines
                >
                  {match.pageContent}
                </SyntaxHighlighter>
              </Grid>
            </Grid>
          </Grid>
        ))}
      </Grid>}
    </HomeContainer>
  );
}

export async function getServerSideProps(context: any) {
  const slug = context.params.slug as string[];
  const server = (context.res.socket as any).server;
  const repository = getRepositoryManager(server);
  return {
    props: {
      project: repository.fetchProjectInfo(slug.join("/")),
    },
  };
}
