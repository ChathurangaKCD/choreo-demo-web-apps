import { Box, Typography } from "@mui/material";
import styles from "./NotificationCard.module.css";

function NotificationCard({
    imgUrl,
    title,
    description,
}: {
    imgUrl: string;
    title: string;
    description: React.ReactNode;
}) {
    return (
        <Box className={styles.notificationCard}>
            <Box className={styles.notificationImgWrap}>
                <img
                    className={styles.notificationImg}
                    src={imgUrl}
                    alt={title}
                />
            </Box>
            <Box>
                <Typography variant="body1">{title}</Typography>
            </Box>
            <Box mt={2}>{description}</Box>
        </Box>
    );
}

export default NotificationCard;
