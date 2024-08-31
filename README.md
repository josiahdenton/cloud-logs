# Cloud Logs

Search AWS CW Logs from the comfort of a desktop app.

## Design

Design of the app will look something along the lines of...

```txt
===============================================================
                         Cloud Logs
===============================================================
[select account to search for logs]
(x) us-east-1 (x) us-west-2
===============================================================
[select log group(s) to search in]
===============================================================
[textarea to input the query]
(search / submit) (quick-cancel)
===============================================================
(search for results - ripgrep)
| @col 1 | @col 2 | @col 3 | @col 4 | @col 5 | @col 6 | @col 7 |
|  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |
|  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |
|  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |
|  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |
|  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |
===============================================================
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)



