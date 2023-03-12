import { useEffect, useState } from "react";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import Container from "@mui/material/Container";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import LoadingButton from "@mui/lab/LoadingButton";
import LaunchIcon from "@mui/icons-material/Launch";

import Text from "components/Text";
import Layout from "components/Layout";

import ReactMarkdown from "react-markdown";

import RepoMetadata from "repo/metadata.json";

interface CodeSnippetMeta {
  source: string;
  score: number;
  summary: string;
  lineNumber: number;
}

interface CodeSnippet {
  pageContent: string;
  metadata: CodeSnippetMeta;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>(
    RepoMetadata.exampleQueries[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<CodeSnippet[]>([]);

  const getSearchResults = async () => {
    setIsLoading(true);

    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
      }),
    });
    const data = await response.json();
    setMatches(data);
    setIsLoading(false);
  };

  return (
    <main>
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
          <>
            <Grid
              container
              alignItems="center"
              sx={{
                mt: 6,
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
              <Grid
                item
                xs={10}
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item xs={10} sx={{ pl: 2 }}>
                  <Text type="header" variant="subtitle1">
                    {RepoMetadata.name}
                  </Text>
                </Grid>
              </Grid>
              <Grid item xs={2} style={{ textAlign: "right" }}>
                <Chip
                  label="indexed"
                  color="primary"
                  size="medium"
                  sx={{ fontSize: "0.9rem", ml: 1 }}
                  variant="outlined"
                />
              </Grid>
            </Grid>

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
                    Ask a question about your codebase...
                  </Text>
                </Grid>
                <Grid item xs={12} sx={{ mt: 4 }}>
                  <TextField
                    id="document_id"
                    label=""
                    variant="outlined"
                    fullWidth
                    placeholder={RepoMetadata.exampleQueries[0]}
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.currentTarget.value)
                    }
                    onKeyDown={(event) => {
                      if (event.keyCode === 13) getSearchResults();
                    }}
                  />
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Grid container spacing={1}>
                    {RepoMetadata.exampleQueries.map((x, i) => (
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
                  loading={isLoading}
                  variant="outlined"
                  onClick={getSearchResults}
                >
                  Search
                </LoadingButton>
              </Grid>
            </Grid>
            <Grid container sx={{ mt: 6 }}>
              {matches.length > 0 && (
                <Grid item xs={8} sx={{ mb: 4 }}>
                  <Text type="header" variant="h4">
                    Top matches
                  </Text>
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
                        label={`Match: ${Math.round(
                          match.metadata.score * 100
                        )}%`}
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
                        href={`https://github.com/${RepoMetadata.name}/tree/main/${match.metadata.source}#L${match.metadata.lineNumber}`}
                        size="small"
                        sx={{ fontSize: "0.85rem", ml: 1, p: 1 }}
                        variant="outlined"
                        clickable
                        target="_blank"
                        onDelete={() => {}}
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
                        language="python"
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
            </Grid>
          </>
        </Container>
      </Layout>
    </main>
  );
}
