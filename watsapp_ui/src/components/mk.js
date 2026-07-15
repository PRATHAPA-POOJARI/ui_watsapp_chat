import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import "../../index.css";
import axios from "axios";
import { assetsInfo } from "../../api/api";

const SectionBar = ({ title }) => (
  <Box className="assetInfoSectionBar">
    <Box className="assetInfoSectionBarAccent" />
    <Box className="assetInfoSectionBarTitle">{title}</Box>
  </Box>
);

const getStatusStyle = (hasFaults) =>
  hasFaults
    ? { bg: "rgba(239,68,68,0.12)", color: "#b91c1c", border: "1px solid rgba(239,68,68,0.3)" }
    : { bg: "rgba(34,197,94,0.12)", color: "#15803d", border: "1px solid rgba(34,197,94,0.3)" };

const StatusBadge = ({ hasFaults }) => {
  const s = getStatusStyle(hasFaults);
  return (
    <Box
      className="assetInfoRadarCardBadge"
      style={{ background: s.bg, color: s.color, border: s.border }}
    >
      {hasFaults ? "FAULT" : "OK"}
    </Box>
  );
};

// ── ChildCard — shown when grandSystemDetails is empty ────────────────────────
const ChildCard = ({ item }) => {
  const hasFaults = item.faults && item.faults.length > 0;
  const s = getStatusStyle(hasFaults);
  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        background: "#f4f7fb",
        border: hasFaults ? "1px solid rgba(239,68,68,0.3)" : "1px solid #dde4ee",
        borderRadius: "5px",
        padding: "5px 8px",
      }}
    >
      <Box
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.8px",
          color: "#2c3e55",
          textTransform: "uppercase",
          flex: 1,
        }}
      >
        {item.sobject}
      </Box>
      <Box
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: "9px",
          fontWeight: 700,
          letterSpacing: "0.8px",
          textTransform: "uppercase",
          padding: "1px 6px",
          borderRadius: "3px",
          background: s.bg,
          color: s.color,
          border: s.border,
        }}
      >
        {hasFaults ? "FAULT" : "OK"}
      </Box>
    </Box>
  );
};

// ── GrandCard — shown when grandSystemDetails.length > 0 ─────────────────────
const GrandCard = ({ classType, label, anyFault, children }) => (
  <Box
    style={{
      background: "#fff",
      border: "1px solid #ccd4e0",
      borderRadius: "10px",
      overflow: "hidden",
      flex: 1,
    }}
  >
    <Box
      style={{
        background: "#e8eef6",
        padding: "7px 14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        borderBottom: "1px solid #ccd4e0",
      }}
    >
      <Box
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "1.8px",
          textTransform: "uppercase",
          color: "#055380",
          flex: 1,
        }}
      >
        {classType} : {label}
      </Box>
      <StatusBadge hasFaults={anyFault} />
    </Box>
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "6px",
        padding: "10px 12px",
      }}
    >
      {children}
    </Box>
  </Box>
);

// ── SubSystems ────────────────────────────────────────────────────────────────
const SubSystems = ({ listsubsystems }) => {
  if (!listsubsystems || listsubsystems.length === 0) return null;

  const groups = listsubsystems.reduce((acc, item) => {
    const key = item.stype;
    if (!acc[key]) acc[key] = { label: item.sobject, items: [] };
    acc[key].items.push(item);
    return acc;
  }, {});

  return (
    <Box className="assetInfoWaypointsWrapper">
      <Box className="assetInfoWaypointsInner">
        <SectionBar title="SubSystems" />
        <Box className="assetInfoSubsystemsBody">
          <Box className="assetInfoLaunchersRow">
            {Object.entries(groups).map(([stype, group]) => {
              const anyFault = group.items.some(
                (m) => m.faults && m.faults.length > 0
              );

              return (
                <GrandCard
                  key={stype}
                  classType={stype}
                  label={group.label}
                  anyFault={anyFault}
                >
                  {group.items.map((m) => {
                    const hasGrand =
                      m.grandSystemDetails && m.grandSystemDetails.length > 0;

                    if (hasGrand) {
                      return m.grandSystemDetails.map((grandItem) => (
                        <ChildCard key={grandItem.sobject} item={grandItem} />
                      ));
                    }

                    return <ChildCard key={m.sobject} item={m} />;
                  })}
                </GrandCard>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ── Waypoints Table Headers ───────────────────────────────────────────────────
const WP_HEADERS = [
  { label: "S.No",        width: "6%"  },
  { label: "Latitude",    width: "13%" },
  { label: "Longitude",   width: "13%" },
  { label: "Altitude",    width: "12%" },
  { label: "Velocity",    width: "11%" },
  { label: "Heading",     width: "11%" },
  { label: "Distance",    width: "14%" },
  { label: "Ex.Duration", width: "13%" },
];

const fieldRows = (a) => [
  [
    { label: "Model",          value: a.model                                           },
    { label: "Class",          value: a.class                                           },
    { label: "Sub Class",      value: a.subclass                                        },
  ],
  [
    { label: "Latitude",       value: a.latitude                                        },
    { label: "Longitude",      value: a.longitude                                       },
    { label: "Altitude",       value: a.altitude                                        },
  ],
  [
    { label: "Heading",        value: a.heading                                         },
    { label: "Velocity",       value: a.velocity                                        },
    { label: "RCS",            value: a.rcs                                             },
  ],
  [
    { label: "Start Time",     value: a.starttime                                       },
    { label: "Total Distance", value: a.total_distance || "—"                           },
    { label: "Duration",       value: a.duration       || "—"                           },
  ],
  [
    { label: "Higher Echelon", value: a.higher_echelon || "—"                           },
    { label: "Range",          value: a.range          || "—"                           },
    { label: "Azimuth",        value: a.azimuth        || "—"                           },
  ],
  [
    { label: "Faults",         value: a.faults?.length > 0 ? a.faults.join(", ") : "—" },
  ],
];

const AssetInfo = () => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(assetsInfo);
        setData(response.data.allAssetsInfo);
      } catch (err) {
        console.error(err);
        setError("Failed to load asset information.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toPascalCase = (str = "") =>
    String(str)
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("");

  if (loading)
    return (
      <Box className="assetInfoWrapper" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box className="assetInfoWrapper" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        <Box sx={{ color: "#b91c1c", fontWeight: 500 }}>{error}</Box>
      </Box>
    );

  if (!data || data.length === 0)
    return (
      <Box className="assetInfoWrapper" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        <Box sx={{ color: "#6b7280" }}>No asset data available.</Box>
      </Box>
    );

  return (
    <Box className="assetInfoWrapper">
      <Paper elevation={3} className="paperCard">
        <Box className="scenarioHeader">
          <Box className="scenarioHeaderAccent" />
          <Box className="scenarioHeaderText">Assets Info</Box>
        </Box>
        <Box className="assetInfoOuter">
          {data.map((asset) => (
            <Box key={asset.objectid} className="assetInfoCard">
              <Box className="assetInfoCardHeader">
                <Box className="assetInfoCardHeaderAccent" />
                <Box className="assetInfoCardHeaderTitle">{asset.objectid}</Box>
              </Box>
              <Box className="assetInfoFieldsWrapper">
                <Box className="assetInfoFieldsInner">
                  {fieldRows(asset).map((row, ri) => (
                    <Box key={ri} className="assetInfoFieldRow">
                      {row.map((f, fi) => (
                        <Box
                          key={fi}
                          className="assetInfoFieldCell"
                          style={{ flex: fi === row.length - 1 && row.length < 3 ? 2 : 1 }}
                        >
                          <Box className="assetInfoFieldLabel">{f.label}</Box>
                          <Box className="assetInfoFieldValue">{toPascalCase(f.value)}</Box>
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
              {asset.lpoints && asset.lpoints.length > 0 && (
                <Box className="assetInfoWaypointsWrapper">
                  <Box className="assetInfoWaypointsInner">
                    <SectionBar title="Waypoints" />
                    <TableContainer>
                      <Table>
                        <TableHead className="tableHead">
                          <TableRow>
                            {WP_HEADERS.map((h) => (
                              <TableCell key={h.label} sx={{ width: h.width }}>{h.label}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody className="tableBody">
                          {asset.lpoints.map((wp, i) => (
                            <TableRow key={i}>
                              {[i + 1, wp.latitude, wp.longitude, wp.altitude, wp.velocity, wp.heading, wp.distance, wp.duration].map((val, vi) => (
                                <TableCell key={vi}>{val}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Box>
              )}
              {asset.listsubsystems && asset.listsubsystems.length > 0 && (
                <SubSystems listsubsystems={asset.listsubsystems} />
              )}
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default AssetInfo;