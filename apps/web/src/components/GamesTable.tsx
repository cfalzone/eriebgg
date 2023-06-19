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
} from '@tremor/react';
import { ArrowLeftIcon, ArrowRightIcon, SearchIcon } from "@heroicons/react/solid";
import { useMemo, useState } from "react";
import { Games } from "games-data";

export default function GamesTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);

  const perPage = 10;
  const games = Games.Games.sort((a, b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });

  const displayData = useMemo(() => {
    const start = (page) * perPage;
    return games.filter(g => g.name.includes(searchTerm)).slice(start, start + perPage);
  }, [games, page, searchTerm]);

  const doSearch = (term: string) => {
    setSearchTerm(term);
    setPage(0);
  }

  const paginationButtons = () => (
    <Flex className="mt-6" justifyContent="between" alignItems="center">
      <Button icon={ArrowLeftIcon} onClick={() => setPage(page - 1)}> Prev Page </Button>
      <Button icon={ArrowRightIcon} onClick={() => setPage(page + 1)}> Next Page </Button>
    </Flex>
  );

  return (
    <>
      <TextInput icon={SearchIcon} value={searchTerm} placeholder="Search..." onChange={(e) => doSearch(e.target.value)} />

      {paginationButtons()}

      <Table className="mt-6">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Game</TableHeaderCell>
            <TableHeaderCell>Image</TableHeaderCell>
            <TableHeaderCell>Users</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayData.map(game => (
            <TableRow key={game.id}>
              <TableCell>{game.id}: {game.name} ({game.yearPublished})</TableCell>
              <TableCell><Image alt={`Image of ${game.name}`} src={game.thumb} width={120} height={0} className="h-auto" /></TableCell>
              <TableCell><ul>
                {game.users.map(u => (<li key={u}>{u}</li>))}
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
