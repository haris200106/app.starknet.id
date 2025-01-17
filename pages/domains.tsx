/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import styles2 from "../styles/domain.module.css";
import { useRouter } from "next/router";
import SearchBar from "../components/UI/searchBar";
import Image from "next/image";

const Domain: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.screen}>
      <div className={styles.firstLeaf}>
        <img alt="leaf" src="/leaves/leaf_2.png" />
      </div>
      <div className={styles.secondLeaf}>
        <img alt="leaf" src="/leaves/leaf_1.png" />
      </div>
      <div className={styles2.containerSearch}>
        <div className={styles2.searchBarContainer}>
          <div className="flex flex-col items-center">
            <img
              src="/visuals/StarknetIdLogo.png"
              height={250}
              width={250}
              alt="logo"
            />
          </div>
          <h1 className={styles.title}>Choose your .stark domain</h1>
          <div className="min-w-content mx-5 mt-5 flex justify-center align-center">
            <SearchBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Domain;
