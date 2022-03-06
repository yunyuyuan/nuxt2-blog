import {getNowDayjs} from "~/utils/_dayjs";
import axios from 'axios';
import {token} from "~/utils/data";
import {notify} from "~/utils/utils";
import config from "@/config";

export async function post(data) {
  if (!token.value) return ;
  return await axios.post('https://api.github.com/graphql', {query: data}, {
    headers: {
      Authorization: 'token ' + token.value
    }
  });
}

function encodeB64(str) {
  return btoa(unescape(encodeURIComponent(str)))
}

/** @description 是否管理员 */
export async function isAuthor() {
  try {
    const result = await post(`query {
    viewer {
      login
    }
  }`);
    const err = result.data.errors;
    if (err) {
      return false;
    } else {
      return result.data.data.viewer.login === config.githubName;
    }
  } catch (e) { }
}

/** @description 获取最后一个 commit id */
async function getCommitId() {
  const result = await post(`query {
    repository(name: "${config.githubRepo}", owner: "${config.githubName}") {
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 1) {
              nodes {
                oid
              }
            }
          }
        }
      }
    }
  }`);
  const err = result.data.errors;
  if(err) {
    notify({
      type: 'error',
      title: err[0].type,
      text: err[0].message
    })
  } else {
    return result.data.data.repository.defaultBranchRef.target.history.nodes[0].oid;
  }
}

/** @description 提交 Github commit */
export async function createCommit(commit='', additions = [], deletions = []) {
  let add = '',
    del = '';
  if (additions.length) {
    add = 'additions: [';
    additions.forEach(item => {
      add += `{path: "${item.path}",contents: "${encodeB64(item.content)}"},`;
    })
    add += '],';
  }
  if (deletions.length) {
    del = 'deletions: [';
    deletions.forEach(item => {
      del += `{path: "${item.path}"},`;
    })
    del += ']';
  }
  try {
    const commitId = await getCommitId();
    if (!commitId) return false;
    // 必须等待上一次编译完成
    if (!commitId.startsWith(process.env.NUXT_ENV_CURRENT_GIT_SHA)) {
      return notify({
        type: 'warn',
        title: '无法修改',
        text: '请等待上一次编译完成!'
      })
    }
    const result = await post(`mutation {
    createCommitOnBranch(
      input: {
        branch: {
          branchName: "${config.githubBranch}",
          repositoryNameWithOwner: "${config.githubName}/${config.githubRepo}"
        },
        message: {
          headline: "[🤖${getNowDayjs().format('YYYY-MM-DD HH:mm:ss')}]${commit}"
        },
        expectedHeadOid: "${commitId}",
        fileChanges: {
          ${add}
          ${del}
        }
      }
    ) {
      clientMutationId
    }
  }`);
    const err = result.data.errors;
    if (err) {
      notify({
        type: 'error',
        title: err[0].type,
        text: err[0].message
      })
      return false;
    }
    return true;
  } catch (e) {
    notify({
      title: 'Error!',
      type: 'error',
      text: e,
    })
  }
}
