import {
    Box,
    Breadcrumbs,
    Container,
    LinearProgress,
    Link as MUILink,
    Typography,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

function OutletContainer({
    title,
    children,
    isLoading = false,
    breadcrumbs = [],
}: {
    title?: string;
    children: React.ReactNode;
    isLoading?: boolean;
    breadcrumbs?: { label: string; link: string }[];
}) {
    return (
        <div>
            {isLoading && <LinearProgress color="secondary" />}
            <Box mt={3}>
                <Container maxWidth="md">
                    <Box
                        mb={3}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        {title && <Typography variant="h4">{title}</Typography>}

                        {breadcrumbs.length > 0 && (
                            <Breadcrumbs aria-label="breadcrumb">
                                {breadcrumbs.map((breadcrumb, index) => (
                                    <>
                                        {index < breadcrumbs.length - 1 ? (
                                            <MUILink
                                                component={Link}
                                                underline="hover"
                                                color="inherit"
                                                to={breadcrumb.link}
                                            >
                                                {breadcrumb.label}
                                            </MUILink>
                                        ) : (
                                            <Typography color="text.primary">
                                                {breadcrumb.label}
                                            </Typography>
                                        )}
                                    </>
                                ))}
                            </Breadcrumbs>
                        )}
                    </Box>
                    <Box>{children}</Box>
                </Container>
            </Box>
        </div>
    );
}

export default OutletContainer;
