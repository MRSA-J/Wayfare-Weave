import Head from "next/head";
import { useRecoilValue } from "recoil";
import { MainView } from "~/components";
import { selectedNodeState } from "~/global/Atoms";
import { useJsApiLoader } from "@react-google-maps/api";
export default function Home() {
  const selectedNode = useRecoilValue(selectedNodeState);
  const title = `${selectedNode?.title ?? "Home"} | MyHypermedia`;
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDIENSkEFyeHB32OHC0R9UYmvKDA81ePHM",
    libraries: ["places"],
  });
  console.log(isLoaded);
  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container">
        {isLoaded ? <MainView /> : <div>loading</div>}
      </div>
    </>
  );
}
