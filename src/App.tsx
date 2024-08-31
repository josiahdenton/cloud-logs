//import { useState } from "react";
import { invoke } from '@tauri-apps/api/tauri';
//import { FaChevronUp, FaChevronDown } from 'react-icons/fa6';
import Dropdown from './Dropdown';
import Input from './Input';
import { useEffect, useState } from 'react';
import Modal from './Modal';
import MultiSelect from './MultiSelect';

function App() {
    const [profiles, setProfiles] = useState<string[]>([]);
    const [newProfile, setNewProfile] = useState<string>('');
    const [selectedProfile, setSelectedProfile] = useState<string>('');
    const [logGroups, setLogGroups] = useState<string[]>([]);
    const [selectedLogGroup, setSelectedLogGroup] = useState<string>('');
    const [islogGroupModalOpen, setlogGroupModalOpen] =
        useState<boolean>(false);

    useEffect(() => {
        //const controller = new AbortController();
        const fetchProfiles = async () => {
            const profiles = await invoke<string[]>('get_all_profile_options');
            console.log('calling get_all_profile_options');
            console.log(profiles);
            setProfiles(profiles);
        };
        // I don't think there is a way to cancel the promise...????
        fetchProfiles();

        // NOTE: this is not available in tauri yet... see https://github.com/tauri-apps/tauri/issues/8351
        // return () => {
        //    controller.abort();
        //};
    }, []);

    useEffect(() => {
        const saveProfile = async () => {
            if (newProfile) {
                console.log('saving profile option', newProfile);
                await invoke('save_profile_option', { profile: newProfile });
            }
        };
        saveProfile();
    }, [newProfile]);

    // we want to select the profile
    useEffect(() => {
        const loadAwsProfile = async () => {
            console.log('loading aws profile', selectedProfile);
            await invoke('choose_profile', { profile: selectedProfile });
            const groups = await invoke<string[]>('list_log_groups');
            setLogGroups(groups);
        };
        loadAwsProfile();
    }, [selectedProfile]);

    useEffect(() => {
        const chooseLogGroup = async () => {
            await invoke('choose_log_group', { group: selectedLogGroup });
        };
        chooseLogGroup();
    }, [selectedLogGroup]);

    const mockLogGroups = [
        'lambda/log-group/abc',
        'lambda/log-group/123',
        'lambda/log-group/xyz',
        'lambda/log-group/456',
    ];
    //<br />
    //<div className="flex flex-row justify-between">
    //    <p>choose regions:</p>
    //    <form>
    //        <input
    //            type="checkbox"
    //            id="region-east"
    //            className="accent-orange-800"
    //        />
    //        <label htmlFor="region-east"> us-east-1</label>
    //        <br />
    //        <input
    //            type="checkbox"
    //            id="region-west"
    //            className="accent-orange-800"
    //        />
    //        <label htmlFor="region-west"> us-west-2</label>
    //    </form>
    //</div>

    return (
        <div className="flex gap-1 flex-row justify-center">
            <div className="flex flex-col justify-center">
                <div className="text-center p-4 font-bold text-xl text-teal-400">
                    Cloud Logs
                </div>
                <div className="py-2">
                    <div className="flex flex-row justify-between">
                        <p>1. choose a profile:</p>
                        <Dropdown
                            options={profiles}
                            optionAdded={(option) => setNewProfile(option)}
                            optionSelected={(option) =>
                                setSelectedProfile(option)
                            }
                        />
                    </div>
                </div>
                <div className="flex flex-row justify-between">
                    <p>2. select log group</p>
                    <button
                        className="bg-gray-900 rounded shadow py-1 px-2 border border-gray-700 hover:bg-gray-800"
                        onClick={() => setlogGroupModalOpen(true)}
                    >
                        + add
                    </button>
                </div>
                <div className="flex flex-row justify-center py-3">
                    {/* TODO: change this to a SearchDropdown */}
                    <Modal
                        isOpen={islogGroupModalOpen}
                        title="Log Groups"
                        onClose={() => setlogGroupModalOpen(false)}
                    >
                        <div className="flex flex-col gap-4">
                            {mockLogGroups.map((group, i) => {
                                return (
                                    <button
                                        className="py-1 px-2 bg-gray-900 border shadow rounded border-gray-700 hover:bg-gray-600"
                                        key={i}
                                        onClick={() => {
                                            setSelectedLogGroup(group);
                                            setlogGroupModalOpen(false);
                                        }}
                                    >
                                        {group}
                                    </button>
                                );
                            })}
                        </div>
                    </Modal>
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
                        className="bg-gray-900 rounded shadow py-1 px-2 border border-gray-700 hover:bg-gray-800"
                    ></textarea>
                </div>
                <div className="py-2 flex fex-row justify-center">
                    <span className="pr-2">search for logs</span>
                    <Input />
                </div>
            </div>
        </div>
    );
}

export default App;
