import React, { useState } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import StatusList from "./StatusList";
import StatusWindow from "./StatusWindow";

const StatusPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [statusList, setStatusList] = useState([]);
    const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

    const selectedStatus = statusList[currentStatusIndex] || null;

    const handleSelectStatus = (status, allStatuses) => {
        const list = allStatuses || [status];
        const index = list.findIndex(s => s.status_id === status.status_id);
        setStatusList(list);
        setCurrentStatusIndex(Math.max(0, index));
    };

    if (isMobile) {
        return (
            <Box sx={{ width: "100%", height: "100%" }}>
                {!selectedStatus && <StatusList onSelect={handleSelectStatus} />}
                {selectedStatus && (
                    <StatusWindow
                        status={selectedStatus}
                        statusList={statusList}
                        currentIndex={currentStatusIndex}
                        onNext={() => {
                            if (currentStatusIndex < statusList.length - 1) {
                                setCurrentStatusIndex(currentStatusIndex + 1);
                            } else {
                                setStatusList([]);
                                setCurrentStatusIndex(0);
                            }
                        }}
                        onPrev={() => {
                            if (currentStatusIndex > 0) {
                                setCurrentStatusIndex(currentStatusIndex - 1);
                            }
                        }}
                        onBack={() => {
                            setStatusList([]);
                            setCurrentStatusIndex(0);
                        }}
                    />
                )}
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", width: "100%", height: "100%" }}>
            <Box sx={{ width: "40%", borderRight: "1px solid #e0e0e0" }}>
                <StatusList onSelect={handleSelectStatus} selectedStatus={selectedStatus} />
            </Box>
            <Box sx={{ width: "60%" }}>
                <StatusWindow
                    status={selectedStatus}
                    statusList={statusList}
                    currentIndex={currentStatusIndex}
                    onNext={() => {
                        if (currentStatusIndex < statusList.length - 1) {
                            setCurrentStatusIndex(currentStatusIndex + 1);
                        }
                    }}
                    onPrev={() => {
                        if (currentStatusIndex > 0) {
                            setCurrentStatusIndex(currentStatusIndex - 1);
                        }
                    }}
                    onBack={() => {
                        setStatusList([]);
                        setCurrentStatusIndex(0);
                    }}
                />
            </Box>
        </Box>
    );
};

export default StatusPage;