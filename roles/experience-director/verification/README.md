# Interactive Experience Director verification

Verified locally on 2026-10-08 (Europe/Berlin), Node 24.19.0 and pnpm 11.19.0.

| Scope | Actual evidence |
| --- | --- |
| Upstream source identity | `source-pins.json`: GitHub API resolves all three exact commits for OpenAI skills, Microsoft Playwright MCP and Lusion WebGL-Scroll-Sync. |
| Skill structure | The bundled skill-creator validator passed both `experience-direction` and the role-adapted `playwright` skill. License/notice from the upstream copy remain. |
| Dependency isolation | Role-only frozen installation of `@playwright/mcp` 0.0.83; no root dependency upgrade. |
| Runtime scope | `codex-role.ps1 -PrepareOnly` succeeds; installed `codex mcp list --json` reports only `experience_browser` and `experience_story` in `config-loader.json`. No desktop hot-loading claim. |
| Story MCP | `mcp-results.json`: initialize, list three closed/read-only tools, retrieve seven actual chapters, specific make composition, full ownership contract, reject unknown/path/type arguments. |
| Browser MCP | `mcp-results.json`: initialize, discover tools, navigate actual local thesis, read accessibility snapshot, send PageDown, take screenshot in the user-designated D: workspace, close isolated browser. |
| Global configuration | Before and after SHA-256 remains `719e39d8c6bfee3e10b7964043b50183a64568cc21081476957ee71eec00bb4e`. Launcher never copies authentication. |
| Visual reference research | Separate isolated browser visited Lusion and Lusion Labs, captured viewport/DOM observations and real wheel input. Four opening/scroll screenshots were viewed; analysis separates observation from inference. |

The browser tool test ran against the available local thesis while the new integration was being developed. It proves tool operation, not final visual acceptance, persistent Canvas behavior or source-content accuracy. Those belong to the parent implementation's final browser and source audit. No physical-device, Firefox, deployment or remote CI result is claimed here.

The output path was corrected after scope audit: working browser captures now use `D:/JosHsuan_Website/_work/bending-active-thesis/cinematic-integration/director-browser`, with actual screenshot creation and CLI configuration reverified. Original technical captures were handed off there. The isolated role configuration and scripts remain in this repository.

The subsequent [independent integration review](INTEGRATION_REVIEW.md) closes the director's rendered findings using eight revised transition frames and eleven final Credits/fallback images, with working evidence on D:. This visual review supplements the parent case's broader test matrix.
