//import { useState } from "react";
//import { invoke } from "@tauri-apps/api/tauri";

function App() {
    //const [greetMsg, setGreetMsg] = useState("");
    //const [name, setName] = useState("");

    //async function greet() {
    //  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    //  setGreetMsg(await invoke("greet", { name }));
    //}                       Cloud Logs
    // ===============================================================
    // [select account to search for logs]
    // (x) us-east-1 (x) us-west-2
    // ===============================================================
    // [select log group(s) to search in]
    // ===============================================================
    // [textarea to input the query]
    // (search / submit) (quick-cancel)
    // ===============================================================
    // (search for results - ripgrep)
    // | @col 1 | @col 2 | @col 3 | @col 4 | @col 5 | @col 6 | @col 7 |
    // |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |
    // |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |
    // |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |
    // |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |
    // |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |
    // ===============================================================
    //

    return (
        <div className="flex gap-1 flex-row justify-center">
            <div className="flex flex-col justify-center">
                <div className="text-center p-4 font-bold text-xl text-orange-600">
                    Cloud Logs
                </div>
                <div>
                    <div className="flex flex-row justify-between">
                        <p>choose an account:</p>
                        <select className="bg-orange-800 rounded-lg p-1">
                            {/* FIXME: will need something other than a dropdown... not good when 50+ log groups */}
                            <option>account #123</option>
                            <option>account #456</option>
                        </select>
                    </div>
                    <br />
                    <div className="flex flex-row justify-between">
                        <p>choose regions:</p>
                        <form>
                            <input
                                type="checkbox"
                                id="region-east"
                                className="accent-orange-800"
                            />
                            <label htmlFor="region-east"> us-east-1</label>
                            <br />
                            <input
                                type="checkbox"
                                id="region-west"
                                className="accent-orange-800"
                            />
                            <label htmlFor="region-west"> us-west-2</label>
                        </form>
                    </div>
                </div>
                <div className="flex flex-row justify-center py-3">
                    <button className="bg-orange-800 rounded p-2 hover:bg-orange-600 active:scale-95">
                        add log group(s)
                    </button>
                </div>
                <div>
                    <br />
                    <label htmlFor="query" className="block text-center">
                        Search Query
                    </label>
                    <textarea
                        cols={50}
                        rows={5}
                        id="query"
                        className="text-slate-900 bg-orange-800 p-2 rounded-xl"
                    ></textarea>
                </div>
                <div>search results go here in a table</div>
            </div>
        </div>
    );
}

export default App;
