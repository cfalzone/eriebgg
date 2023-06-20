import Image from "next/image";
import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TextInput,
  Flex,
  Button,
  Text,
  Select,
  SelectItem,
  Grid,
  Col,
} from '@tremor/react';
import { ArrowLeftIcon, ArrowRightIcon, SearchIcon } from "@heroicons/react/solid";
import { useMemo, useState } from "react";
import { Games } from "games-data";

export default function GamesTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [showThumbs, setShowThumbs] = useState(false);
  const [perPage, setPerPage] = useState(20);

  const games = Games.Games.sort((a, b) => {
    const nameA = a.name.toString().toUpperCase();
    const nameB = b.name.toString().toUpperCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });

  const displayData = useMemo(() => {
    const start = (page) * perPage;
    const filteredGames = games.filter(g => g.name.toString().includes(searchTerm))
    return (perPage === 0) ? filteredGames : filteredGames.slice(start, start + perPage);
  }, [games, page, searchTerm, perPage]);

  const hasPreviousPage = page > 0;
  const totalPages = perPage == 0 ? 0 : Math.ceil((games.length / perPage) - 1);
  const hasNextPage = page < totalPages;

  const doSearch = (term: string) => {
    setSearchTerm(term);
    setPage(0);
  }

  const doPerPage = (pp: number) => {
    setPerPage(pp);
    setPage(0);
  }

  const paginationButtons = (withFilters = false) => (
    <Grid numItems={2} className="mt-6 gap-3">
      <Col numColSpan={2}>
        {
          withFilters &&
          <>
            <div className="ml-6 text-center">
              <label htmlFor="showThumbsCheckbox" className="text-white">Show Thumbs &nbsp;
                <input name="showThumbs" type="checkbox" checked={showThumbs} onChange={(e) => setShowThumbs(e.target.checked)} />
              </label>
              <Text>Note: turning on thumbs with more than 20 per page is not advised.</Text>
            </div>
            <Select placeholder={`Per Page: ${perPage === 0 ? 'All' : perPage}`} onValueChange={(val) => doPerPage(parseInt(val))}>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="0">All</SelectItem>
            </Select>
          </>
        }
      </Col>
      <Col>
        <Button disabled={!hasPreviousPage} icon={ArrowLeftIcon} onClick={() => setPage(page - 1)}> Prev Page </Button>
      </Col>
      <Col className="text-right">
        <Button disabled={!hasNextPage} icon={ArrowRightIcon} onClick={() => setPage(page + 1)}> Next Page </Button>
      </Col>
      <Col numColSpan={2}>
        <Text className="text-center">{perPage === 0 ? `Showing All` : `Showing Page ${page + 1} of ${totalPages + 1}`}. Total Games: {games.length}.</Text>
      </Col>
    </Grid>
  );

  return (
    <>
      <TextInput icon={SearchIcon} value={searchTerm} placeholder="Search..." onChange={(e) => doSearch(e.target.value)} />

      {paginationButtons(true)}

      <Table className="mt-6">
        <TableHead>
          <TableRow>
            <TableHeaderCell>BGG ID</TableHeaderCell>
            <TableHeaderCell>Game</TableHeaderCell>
            <TableHeaderCell>Year</TableHeaderCell>
            {showThumbs && <TableHeaderCell>Image</TableHeaderCell>}
            <TableHeaderCell>Users</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            displayData.map(game => (
              <TableRow key={game.id}>
                <TableCell>{game.id}</TableCell>
                <TableCell dangerouslySetInnerHTML={{ __html: game.name.toString() }}></TableCell>
                <TableCell>{game.yearPublished}</TableCell>
                {showThumbs && <TableCell><Image alt={`Image of ${game.name}`} src={game.thumb} width={120} height={0} className="h-auto" /></TableCell>}
                <TableCell><ul>
                  {game.users.map(u => (<li key={u.username}>{u.display}</li>))}
                </ul></TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>

      {paginationButtons()}
    </>
  )
}
