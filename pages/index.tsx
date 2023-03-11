import { useEffect, useState } from "react";

import Head from "next/head";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import path from "path";

import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import LoadingButton from "@mui/lab/LoadingButton";
import LaunchIcon from "@mui/icons-material/Launch";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import Text from "components/Text";
import Layout from "components/Layout";

interface CodeSnippetMeta {
  source: string;
  score: number;
}

interface CodeSnippet {
  pageContent: string;
  metadata: CodeSnippetMeta;
}

interface LocalStorageObject {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  html_url: string;
  default_branch: string;
  indexed_by_wizi: boolean;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<CodeSnippet[]>([]);
  const [userRepos, setUserRepos] = useState<any[]>([]);
  const [indexingInProgress, setIndexingInProgress] = useState(false);
  const [indexed, setIndexed] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");

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

  const setSelectedRepo = (id: string) => {
    setSelectedRepoId(id);
    const repo = userRepos.filter((repo) => repo.id.toString() === id)[0];
    localStorage.setItem(
      "wizi-ai-selected-repo",
      JSON.stringify({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        owner: repo.owner.login,
        html_url: repo.html_url,
        default_branch: repo.default_branch,
        indexed_by_wizi: false,
      })
    );
    const localObject = localStorage.getItem("wizi-ai-selected-repo");
    setIndexed(false);
    if (localObject) {
      setLocalStorageObject(JSON.parse(localObject));
    }
  };

  return (
    <main>
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
          <>
            <Grid container>
              <Text type="header" variant="h4">
                Code Search by TabbyML
              </Text>
            </Grid>
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
                    huggingface/diffusers
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
                    placeholder="Where can I check if user has an active subscription?"
                    variant="outlined"
                    fullWidth
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.currentTarget.value)
                    }
                  />
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
                        href={`https://github.com/huggingface/diffusers/tree/main/${match.metadata.source}`}
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
                      <SyntaxHighlighter
                        language="jsx"
                        style={atomDark}
                        showLineNumbers
                        showInlineLineNumbers
                        startingLineNumber={1}
                        wrapLongLines
                        customStyle={{ color: "red" }}
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
