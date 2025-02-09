import { useEffect, useState } from "react";
import Sidebar, { SidebarMobileHeader } from "../../../components/AdminSidebar";
import { isMobile } from "react-device-detect";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { PlusCircle } from "react-feather";
import usePrefersDarkMode from "../../../hooks/usePrefersDarkMode";
import Admin from "../../../models/admin";
import ApiKeyRow from "./ApiKeyRow";
import NewApiKeyModal, { NewApiKeyModalId } from "./NewApiKeyModal";
import paths from "../../../utils/paths";

export default function AdminApiKeys() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-orange-100 dark:bg-stone-700 flex">
      {!isMobile && <Sidebar />}
      <div
        style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
        className="transition-all duration-500 relative md:ml-[2px] md:mr-[8px] md:my-[16px] md:rounded-[26px] bg-white dark:bg-black-900 md:min-w-[82%] p-[18px] h-full overflow-y-scroll"
      >
        {isMobile && <SidebarMobileHeader />}
        <div className="flex flex-col w-full px-1 md:px-8">
          <div className="w-full flex flex-col gap-y-1">
            <div className="items-center flex gap-x-4">
              <p className="text-3xl font-semibold text-slate-600 dark:text-slate-200">
                API Keys
              </p>
              <button
                onClick={() =>
                  document?.getElementById(NewApiKeyModalId)?.showModal()
                }
                className="border border-slate-800 dark:border-slate-200 px-4 py-1 rounded-lg text-slate-800 dark:text-slate-200 text-sm items-center flex gap-x-2 hover:bg-slate-800 hover:text-slate-100 dark:hover:bg-slate-200 dark:hover:text-slate-800"
              >
                <PlusCircle className="h-4 w-4" /> Generate New API Key
              </button>
            </div>
            <p className="text-sm font-base text-slate-600 dark:text-slate-200">
              API keys allow the holder to programmatically access and manage
              this LegalEagle instance.
            </p>
            <a
              href={paths.apiDocs()}
              target="_blank"
              className="text-blue-600 dark:text-blue-300 hover:underline"
            >
              Read the API documentation &rarr;
            </a>
          </div>
          <ApiKeysContainer />
        </div>
        <NewApiKeyModal />
      </div>
    </div>
  );
}

function ApiKeysContainer() {
  const darkMode = usePrefersDarkMode();
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState([]);
  useEffect(() => {
    async function fetchExistingKeys() {
      const { apiKeys: foundKeys } = await Admin.getApiKeys();
      setApiKeys(foundKeys);
      setLoading(false);
    }
    fetchExistingKeys();
  }, []);

  if (loading) {
    return (
      <Skeleton.default
        height="80vh"
        width="100%"
        baseColor={darkMode ? "#2a3a53" : null}
        highlightColor={darkMode ? "#395073" : null}
        count={1}
        className="w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
        containerClassName="flex w-full"
      />
    );
  }

  return (
    <table className="md:w-3/4 w-full text-sm text-left text-gray-500 dark:text-gray-400 rounded-lg mt-5">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-stone-800 dark:text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            API Key
          </th>
          <th scope="col" className="px-6 py-3">
            Created By
          </th>
          <th scope="col" className="px-6 py-3">
            Created
          </th>
          <th scope="col" className="px-6 py-3 rounded-tr-lg">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {apiKeys.map((apiKey) => (
          <ApiKeyRow key={apiKey.id} apiKey={apiKey} />
        ))}
      </tbody>
    </table>
  );
}
