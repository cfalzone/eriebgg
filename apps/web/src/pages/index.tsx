import { Card, Flex, Title } from "@tremor/react";
import GamesTable from "../components/GamesTable";
import { NextPageWithLayout } from "./_app";

const IndexPage: NextPageWithLayout = () => {
  return (
    <Flex flexDirection="col" className="px-12 py-12">
      <Title>
        Erie Boardgames BGG Collection Browser
      </Title>
      <p className='text-center mt-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-red-500'>
        This is a Board game collection browser. It uses the <a target="_blank" href="https://">BoardGameGeek.com</a> API. <br />
        To get your collection added, message Chris in the Messenger Group. If you don&apos;t know what that is, this is not for you.
      </p>
      <Card className='mt-12'>
        <GamesTable />
      </Card>
    </Flex>
  );
}

export default IndexPage;
