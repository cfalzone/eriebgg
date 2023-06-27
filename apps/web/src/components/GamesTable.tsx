import { ArrowLeftIcon, ArrowRightIcon, ArrowTopRightOnSquareIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  TextInput,
} from '@tremor/react';
import { Games } from "games-data";
import Image from "next/image";
import { useMemo, useState } from "react";

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
    <>
      {
        withFilters &&
        <div className="grid grid-cols-2 mt-6 gap-3">
          <div className="col-span-2 md:col-span-1 ml-6 text-center">
            <label htmlFor="showThumbsCheckbox" className="text-white">Show Thumbs &nbsp;
              <input name="showThumbs" type="checkbox" checked={showThumbs} onChange={(e) => setShowThumbs(e.target.checked)} />
            </label>
            <Text>Note: turning on thumbs with more than 20 per page is not advised.</Text>
          </div>
          <div className="col-span-2 md:col-span-1 ml-6 text-center">
            <div className="max-w-sm mx-auto space-y-6">
              <Select className="max-w-100" placeholder={`Per Page: ${perPage === 0 ? 'All' : perPage}`} onValueChange={(val) => doPerPage(parseInt(val))}>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="0">All</SelectItem>
              </Select>
            </div>
          </div>
        </div>
      }
      <div className="grid grid-cols-4 mt-6 gap-3">
        <div className="col-span-2 md:col-span-1 md:order-1">
          <Button disabled={!hasPreviousPage} icon={ArrowLeftIcon} onClick={() => setPage(page - 1)}>
            <span className="hidden md:inline lg:inline">Prev Page</span>
          </Button>
        </div>
        <div className="col-span-2 md:col-span-1 md:order-3 text-right">
          <Button disabled={!hasNextPage} icon={ArrowRightIcon} onClick={() => setPage(page + 1)}>
            <span className="hidden md:inline lg:inline">Next Page</span>
          </Button>
        </div>
        <div className="col-span-4 md:col-span-2 md:order-2">
          <Text className="text-center">{perPage === 0 ? `Showing All` : `Showing Page ${page + 1} of ${totalPages + 1}`}. Total Games: {games.length}.</Text>
        </div>
      </div>
    </>
  );

  return (
    <>
      <TextInput icon={MagnifyingGlassIcon} value={searchTerm} placeholder="Search..." onChange={(e) => doSearch(e.target.value)} />

      {paginationButtons(true)}

      <Table className="mt-6">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Game</TableHeaderCell>
            <TableHeaderCell>Year</TableHeaderCell>
            {showThumbs && <TableHeaderCell>Image</TableHeaderCell>}
            <TableHeaderCell>Users</TableHeaderCell>
            <TableHeaderCell>BGG Link</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            displayData.map(game => (
              <TableRow key={game.id}>
                <TableHeaderCell dangerouslySetInnerHTML={{ __html: game.name.toString() }}></TableHeaderCell>
                <TableCell>{game.yearPublished}</TableCell>
                {showThumbs && <TableCell><Image alt={`Image of ${game.name}`} src={game.thumb} width={120} height={0} className="h-auto" /></TableCell>}
                <TableCell><ul>
                  {game.users.map(u => (<li key={u.username}>{u.display}</li>))}
                </ul></TableCell>
                <TableCell>
                  <Button size="xs" icon={ArrowTopRightOnSquareIcon} onClick={(e) => window.open(`https://boardgamegeek.com/boardgame/${game.id}`, "_blank")}>
                    {game.id}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>

      {paginationButtons()}
    </>
  )
}
