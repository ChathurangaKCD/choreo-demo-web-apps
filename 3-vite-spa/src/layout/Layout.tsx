import { useAuthContext } from "@asgardeo/auth-react";
import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { useQuery } from "react-query";
import styles from "./Layout.module.css";
import { Link, Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <div className={styles.layout}>
            <AppBar position="static">
                <Toolbar>
                    <nav className={styles.topMenu}>
                        <div className={styles.topMenuLogo}>
                            <Typography variant="h6">Todo App</Typography>
                        </div>
                        <ul className={styles.topMainMenuUl}>
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/todos">Todos</Link>
                            </li>
                        </ul>
                        <ul className={styles.topUserMenuUl}>
                            <li>
                                <User />
                            </li>
                        </ul>
                    </nav>
                </Toolbar>
            </AppBar>
            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    );
}

function User() {
    const authCtx = useAuthContext();
    const basicUerInfoQuery = useQuery("basicUserInfo", () => {
        return authCtx.getBasicUserInfo();
    });
    if (!basicUerInfoQuery.isSuccess) {
        return null;
    }
    const user = basicUerInfoQuery.data;
    return (
        <div className={styles.userWrap}>
            <div className={styles.userEmail}>
                {user.email ? user.email : "John Doe"}
            </div>
            <Button
                color="secondary"
                className={styles.signOut}
                onClick={() => authCtx.signOut()}
                variant="contained"
            >
                Sign out
            </Button>
        </div>
    );
}
