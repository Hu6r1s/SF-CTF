import {
  MDBBtn,
  MDBCardHeader,
  MDBInput,
  MDBPagination,
  MDBPaginationItem,
  MDBPaginationLink,
  MDBTable,
  MDBTableBody,
  MDBTableHead,
} from "mdb-react-ui-kit";
import React, { useEffect, useMemo, useState } from "react";
import { GetUsersResponseDtoUsersInner, UserApi } from "../../../../api";
import { useAuthContext } from "../../../../context/AuthProvider";
import handleNumberInput from "../../../../util/handleNumberInput";
import handleStringInput from "../../../../util/handleStringInput";

export default function User() {
  const { auth } = useAuthContext();
  const [users, setUsers] = useState<GetUsersResponseDtoUsersInner[]>([]);
  const [targetUsername, setTargetUsername] = useState<string>("");
  const [targetNickname, setTargetNickname] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  async function getUsers() {
    if (!auth) {
      return;
    }
    const response = await new UserApi(
      undefined,
      location.origin
    ).usersControllerGetUsers({
      accessToken: auth.token,
      username: targetUsername,
      nickname: targetNickname,
      page: page - 1,
    });

    const { users, pages } = response.data;
    setUsers(users);
    setTotalPages(pages);
  }

  function checkedMovePage(newPage: number) {
    const outRange = newPage < 1 || newPage > totalPages;
    if (outRange) {
      return;
    }
    setPage(newPage);
  }

  useEffect(() => {
    getUsers();
  }, [auth, targetUsername, targetNickname, page]);

  const tableContent = useMemo(
    () => (
      <MDBTableBody>
        {users.map((user) => {
          const username = user.username!;
          const nickname = user.nickname!;
          const isAdmin = user.isAdmin!;
          const isBanned = user.isBanned!;
          const key = `user-row-${username}`;

          return (
            <tr key={key} className='table-dark'>
              <td title={username}>{username}</td>
              <td title={nickname}>{nickname}</td>
              <td>
                <MDBBtn
                  onClick={() => {
                    new UserApi(undefined, location.origin)
                      .usersControllerManage({
                        accessToken: auth!.token,
                        username,
                        admin: !isAdmin,
                        ban: isBanned,
                      })
                      .then(() => getUsers());
                  }}
                >
                  {isAdmin ? "Revoke" : "Grant"}
                </MDBBtn>
              </td>
              <td>
                <MDBBtn
                  onClick={() => {
                    new UserApi(undefined, location.origin)
                      .usersControllerManage({
                        accessToken: auth!.token,
                        username,
                        admin: isAdmin,
                        ban: !isBanned,
                      })
                      .then(() => getUsers());
                  }}
                >
                  {isBanned ? "Allow" : "Ban"}
                </MDBBtn>
              </td>
            </tr>
          );
        })}
      </MDBTableBody>
    ),
    [users]
  );

  return (
    <>
      <MDBCardHeader className='text-white bg-dark'>
        <MDBPagination className="mb-0">
          <MDBPaginationItem>
            <MDBPaginationLink
              href="#"
              onClick={() => checkedMovePage(page - 1)}
            >
              <span aria-hidden="true">«</span>
            </MDBPaginationLink>
          </MDBPaginationItem>
          <MDBPaginationItem>
            <MDBInput
              label="Page"
              value={page}
              onChange={handleNumberInput(setPage)}
              style={{ color: '#fff' }}
            />
          </MDBPaginationItem>
          <MDBPaginationItem>
            <MDBPaginationLink style={{ color: '#fff' }}>/ {totalPages}</MDBPaginationLink>
          </MDBPaginationItem>
          <MDBPaginationItem>
            <MDBPaginationLink
              href="#"
              onClick={() => checkedMovePage(page + 1)}
            >
              <span aria-hidden="true" style={{ color: '#fff' }}>»</span>
            </MDBPaginationLink>
          </MDBPaginationItem>
        </MDBPagination>
      </MDBCardHeader>
      <MDBTable small>
        <MDBTableHead>
          <tr className='table-dark'>
            <th scope="col">
              <MDBInput
                contrast
                label="Username"
                value={targetUsername}
                onChange={handleStringInput(setTargetUsername)}
              />
            </th>
            <th scope="col">
              <MDBInput
                contrast
                label="Nickname"
                value={targetNickname}
                onChange={handleStringInput(setTargetNickname)}
              />
            </th>
            <th scope="col">Admin</th>
            <th scope="col">Ban</th>
          </tr>
        </MDBTableHead>
        {tableContent}
      </MDBTable>
    </>
  );
}
