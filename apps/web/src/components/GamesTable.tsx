import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
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
} from "@tremor/react";
import { Games } from "games-data";
import Image from "next/image";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function GamesTable() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const searchTerm = searchParams.get("query") ?? "";
  const page = parseInt(searchParams.get("page") ?? "0");
  const showThumbs = searchParams.get("thumbs") === "true" ? true : false;
  const perPage = parseInt(searchParams.get("size") ?? "20");

  const games = Games.Games.sort((a, b) => {
    const nameA = a.name.toString().toUpperCase();
    const nameB = b.name.toString().toUpperCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });

  const displayData = useMemo(() => {
    const start = page * perPage;
    const filteredGames = games.filter((g) =>
      g.name.toString().includes(searchTerm)
    );
    return perPage === 0
      ? filteredGames
      : filteredGames.slice(start, start + perPage);
  }, [games, page, searchTerm, perPage]);

  const hasPreviousPage = page > 0;
  const totalPages = perPage == 0 ? 0 : Math.ceil(games.length / perPage - 1);
  const hasNextPage = page < totalPages;

  function debounce(callback, delay) {
    let timeoutId;

    return function () {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };
  }

  const doSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const doPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", p.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const doPerPage = (pp: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("size", pp.toString());
    params.set("page", "0");
    router.push(`${pathname}?${params.toString()}`);
  };

  const doShowThumbs = (t: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("thumbs", t.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const paginationButtons = (withFilters = false) => (
    <>
      {withFilters && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="col-span-2 ml-6 text-center md:col-span-1">
            <label htmlFor="showThumbsCheckbox" className="text-white">
              Show Thumbs &nbsp;
              <input
                name="showThumbs"
                type="checkbox"
                checked={showThumbs}
                onChange={(e) => doShowThumbs(e.target.checked)}
              />
            </label>
            <Text>
              Note: turning on thumbs with more than 20 per page is not advised.
            </Text>
          </div>
          <div className="col-span-2 ml-6 text-center md:col-span-1">
            <div className="mx-auto max-w-sm space-y-6">
              <Select
                className="max-w-100"
                placeholder={`Per Page: ${perPage === 0 ? "All" : perPage}`}
                onValueChange={(val) => doPerPage(parseInt(val))}
              >
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="0">All</SelectItem>
              </Select>
            </div>
          </div>
        </div>
      )}
      <div className="mt-6 grid grid-cols-4 gap-3">
        <div className="col-span-2 md:order-1 md:col-span-1">
          <Button
            disabled={!hasPreviousPage}
            icon={ArrowLeftIcon}
            onClick={() => doPage(hasPreviousPage ? page - 1 : 0)}
          >
            <span className="hidden md:inline lg:inline">Prev Page</span>
          </Button>
        </div>
        <div className="col-span-2 text-right md:order-3 md:col-span-1">
          <Button
            disabled={!hasNextPage}
            icon={ArrowRightIcon}
            onClick={() => doPage(hasNextPage ? page + 1 : page)}
          >
            <span className="hidden md:inline lg:inline">Next Page</span>
          </Button>
        </div>
        <div className="col-span-4 md:order-2 md:col-span-2">
          <Text className="text-center">
            {perPage === 0
              ? `Showing All`
              : `Showing Page ${page + 1} of ${totalPages + 1}`}
            . Total Games: {games.length}.
          </Text>
        </div>
      </div>
    </>
  );

  return (
    <>
      <TextInput
        icon={MagnifyingGlassIcon}
        value={searchTerm}
        placeholder="Search..."
        onChange={debounce((e) => doSearch(e.target.value), 500)}
      />

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
          {displayData.map((game) => (
            <TableRow key={game.id}>
              <TableHeaderCell
                dangerouslySetInnerHTML={{ __html: game.name.toString() }}
              ></TableHeaderCell>
              <TableCell>{game.yearPublished}</TableCell>
              {showThumbs && (
                <TableCell>
                  <Image
                    alt={`Image of ${game.name}`}
                    src={game.thumb}
                    width={120}
                    height={0}
                    className="h-auto"
                  />
                </TableCell>
              )}
              <TableCell>
                <ul>
                  {game.users.map((u) => (
                    <li key={u.username}>{u.display}</li>
                  ))}
                </ul>
              </TableCell>
              <TableCell>
                <Button
                  size="xs"
                  icon={ArrowTopRightOnSquareIcon}
                  onClick={(e) =>
                    window.open(
                      `https://boardgamegeek.com/boardgame/${game.id}`,
                      "_blank"
                    )
                  }
                >
                  {game.id}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {paginationButtons()}
    </>
  );
}
