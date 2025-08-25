/**
 * Bug Bounty Dashboard Component
 * Main dashboard for bug bounty program
 *
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 * @contact mounir.webdev.tms@gmail.com
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useDataFetching } from "../../hooks/useStandardErrorHandling";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
  Alert,
  Fab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Skeleton,
  CardActions,
  IconButton,
  Badge,
  Zoom,
  Slide,
  CircularProgress,
} from "@mui/material";
// @ts-ignore - Module types not available
import Grid from "@mui/material/Grid2";
import {
  BugReport as BugIcon,
  Add as AddIcon,
  TrendingUp as TrendingIcon,
  EmojiEvents as TrophyIcon,
  AttachMoney as MoneyIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  AdminPanelSettings as AdminIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
  LocalFireDepartment as FireIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useCustomTheme } from "../../contexts/ThemeContext";
import { useSettings } from "../../contexts/SettingsContext";
import BugReportForm from "./BugReportForm";
import BugBountyAdmin from "./BugBountyAdmin";
import bugBountyService, {
  BUG_CATEGORIES,
  BUG_STATUS,
} from "../../services/bugBountyService.js";

// Define interfaces for the data structures
interface BugReward {
  final?: number;
  calculated?: number;
}

interface Bug {
  id: string;
  title: string;
  category: string;
  status: string;
  reward?: BugReward;
  submittedAt: string;
}

interface Tester {
  id: string;
  name: string;
  totalConfirmed: number;
  rank: string;
  totalEarnings?: number;
}

interface Stats {
  totalBugs?: number;
  byCategory?: {
    [key: string]: number;
  };
}

interface DashboardData {
  bugs: Bug[];
  leaderboard: Tester[];
  stats: Stats;
}

const BugBountyDashboard = () => {
  const theme = useTheme();
  const { mode, isDark, colorPreset, density, animations } = useCustomTheme();
  const { settings } = useSettings();
  const [reportFormOpen, setReportFormOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Use standardized error handling for data fetching
  const {
    data: dashboardData,
    loading,
    error,
    fetchData,
    refresh,
    handleError,
    clearError,
    canRetry,
    retry,
  } = useDataFetching<DashboardData>("BugBountyDashboard", {
    fallbackDataType: "bugs",
    maxRetries: 3,
    retryDelay: 2000,
  });

  // Extract data from dashboard data
  const bugs: Bug[] = dashboardData?.bugs || [];
  const leaderboard: Tester[] = dashboardData?.leaderboard || [];
  const stats: Stats = dashboardData?.stats || {};

  // Memoized calculations for performance
  const totalRewards = useMemo(() => {
    return bugs.reduce((total: number, bug: Bug) => {
      return total + (bug.reward?.final || bug.reward?.calculated || 0);
    }, 0);
  }, [bugs]);

  const criticalBugsCount = useMemo(() => {
    return stats.byCategory?.CRITICAL || 0;
  }, [stats]);

  const recentBugs = useMemo(() => {
    return bugs.slice(0, 10);
  }, [bugs]);

  const topTesters = useMemo(() => {
    return leaderboard.slice(0, 5);
  }, [leaderboard]);

  // Optimized data loading with standardized error handling
  const loadData = useCallback(async () => {
    return await fetchData(
      async () => {
        const [bugsResult, leaderboardResult, statsResult] = await Promise.all([
          bugBountyService.getBugs({ limit: 20 }),
          bugBountyService.getLeaderboard(15),
          bugBountyService.getStats(),
        ]);

        return {
          bugs: bugsResult.success ? bugsResult.bugs : [],
          leaderboard: leaderboardResult.success
            ? leaderboardResult.leaderboard
            : [],
          stats: statsResult.success ? statsResult.stats : {},
        } as DashboardData;
      },
      { operation: "loadDashboardData" }
    );
  }, [fetchData]);

  // Use a ref to prevent the effect from running more than once
  const initialLoadComplete = useRef(false);

  useEffect(() => {
    if (!initialLoadComplete.current) {
      loadData();
      initialLoadComplete.current = true;
    }
  }, [loadData]);

  const handleBugSubmit = useCallback(
    (result: { success: boolean }) => {
      if (result.success) {
        refresh(); // Refresh data using standardized method
      }
    },
    [refresh]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setTimeout(() => setRefreshing(false), 1000); // Keep spinner for UX
    }
  }, [refresh]);

  // Memoized utility functions for performance
  const getStatusColor = useCallback((status: string): "info" | "warning" | "success" | "default" | "error" | "primary" => {
    const colors: { [key: string]: "info" | "warning" | "success" | "default" | "error" | "primary" } = {
      [BUG_STATUS.SUBMITTED]: "info",
      [BUG_STATUS.UNDER_REVIEW]: "warning",
      [BUG_STATUS.CONFIRMED]: "success",
      [BUG_STATUS.DUPLICATE]: "default",
      [BUG_STATUS.INVALID]: "error",
      [BUG_STATUS.FIXED]: "success",
      [BUG_STATUS.REWARDED]: "primary",
    };
    return colors[status] || "default";
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    const icons: { [key: string]: React.ReactElement } = {
      [BUG_STATUS.SUBMITTED]: <TimelineIcon />,
      [BUG_STATUS.UNDER_REVIEW]: <AssessmentIcon />,
      [BUG_STATUS.CONFIRMED]: <StarIcon />,
      [BUG_STATUS.DUPLICATE]: <BugIcon />,
      [BUG_STATUS.INVALID]: <BugIcon />,
      [BUG_STATUS.FIXED]: <StarIcon />,
      [BUG_STATUS.REWARDED]: <MoneyIcon />,
    };
    return icons[status] || <BugIcon />;
  }, []);

  // Enhanced loading skeleton
  const LoadingSkeleton = () => (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width="60%" height={60} />
        <Skeleton variant="text" width="40%" height={30} />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={60}
          sx={{ mt: 2 }}
        />
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card>
              <CardContent>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={40}
                  sx={{ mt: 1 }}
                />
                <Skeleton variant="text" width="60%" height={20} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="30%" height={30} />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={300}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="40%" height={30} />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={200}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Enhanced Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
              }}
            >
              🐛 Bug Bounty Program
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Help us improve TECHNO-ETL and earn rewards!
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                color="primary"
                sx={{
                  animation: refreshing ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Button
              variant="outlined"
              startIcon={<AdminIcon />}
              onClick={() => setAdminPanelOpen(true)}
              sx={{ minWidth: "auto" }}
            >
              Admin
            </Button>
          </Box>
        </Box>

        <Alert
          severity="info"
          sx={{
            mt: 2,
            background: `linear-gradient(135deg, ${theme.palette.info.light}15, ${theme.palette.info.main}10)`,
            border: `1px solid ${theme.palette.info.main}30`,
          }}
          icon={<FireIcon />}
        >
          <Box>
            <Typography variant="body2" component="div">
              <strong>How it works:</strong> Find bugs, report them with detailed
              information, and earn rewards based on severity and quality. All
              reports are reviewed by our team.
            </Typography>
            <Typography variant="body2" component="div" sx={{ mt: 1 }}>
              <strong>💰 Rewards range from $25 to $3,375</strong> based on
              category, severity, and quality!
            </Typography>
          </Box>
        </Alert>

        {/* Error Display */}
        {error && (
          <Alert
            severity="warning"
            sx={{ mt: 2 }}
            action={
              canRetry && (
                <Button color="inherit" size="small" onClick={retry}>
                  Retry
                </Button>
              )
            }
            onClose={clearError}
          >
            <Typography variant="body2" component="div">{error.message}</Typography>
          </Alert>
        )}
      </Box>

      {/* Enhanced Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: "Total Bugs Reported",
            value: stats.totalBugs || 0,
            icon: <BugIcon />,
            color: theme.palette.primary.main,
            gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          },
          {
            title: "Total Rewards",
            value: formatCurrency(totalRewards),
            icon: <MoneyIcon />,
            color: theme.palette.success.main,
            gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
          },
          {
            title: "Critical Bugs",
            value: criticalBugsCount,
            icon: <SecurityIcon />,
            color: theme.palette.error.main,
            gradient: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
          },
          {
            title: "Active Testers",
            value: leaderboard.length,
            icon: <TrophyIcon />,
            color: theme.palette.info.main,
            gradient: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
          },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Zoom in={!loading} style={{ transitionDelay: `${index * 100}ms` }}>
              <Card
                sx={{
                  background: stat.gradient,
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[8],
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "100px",
                    height: "100px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "50%",
                    transform: "translate(30px, -30px)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        width: 56,
                        height: 56,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: "bold", color: "white" }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.9)" }}
                      >
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Enhanced Reward Categories */}
      <Card
        sx={{
          mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
              <MoneyIcon />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              💰 Reward Categories
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {Object.entries(BUG_CATEGORIES as { [key: string]: any }).map(([key, category], index) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Slide
                  in={!loading}
                  direction="up"
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      transition: "all 0.3s ease-in-out",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: theme.shadows[4],
                        borderColor: category.color,
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Chip
                          label={category.name}
                          sx={{
                            backgroundColor: category.color,
                            color: "white",
                            fontWeight: "bold",
                          }}
                        />
                        <Badge
                          badgeContent={`${category.multiplier}x`}
                          color="secondary"
                          sx={{ ml: "auto" }}
                        >
                          <Typography
                            variant="h6"
                            color="primary"
                            sx={{ fontWeight: "bold" }}
                          >
                            {formatCurrency(category.baseReward)}
                          </Typography>
                        </Badge>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.6 }}
                      >
                        {category.description}
                      </Typography>
                      <Box
                        sx={{
                          mt: 2,
                          pt: 2,
                          borderTop: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Priority: {category.priority} • Max Reward:{" "}
                          {formatCurrency(
                            category.baseReward * category.multiplier * 2
                          )}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Bugs */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                    <TimelineIcon />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    Recent Bug Reports
                  </Typography>
                  {refreshing && <CircularProgress size={20} />}
                </Box>
                <Button
                  startIcon={<VisibilityIcon />}
                  onClick={() => setLeaderboardOpen(true)}
                  variant="outlined"
                >
                  View Leaderboard
                </Button>
              </Box>
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Category
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Reward</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Submitted
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentBugs.map((bug: Bug, index: number) => (
                      <TableRow
                        key={bug.id}
                        sx={{
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                          },
                          "&:nth-of-type(odd)": {
                            backgroundColor: theme.palette.action.hover + "20",
                          },
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {getStatusIcon(bug.status)}
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ maxWidth: 200 }}
                            >
                              {bug.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              (BUG_CATEGORIES as { [key: string]: any })[bug.category]?.name || bug.category
                            }
                            sx={{
                              backgroundColor:
                                (BUG_CATEGORIES as { [key: string]: any })[bug.category]?.color,
                              color: "white",
                              fontWeight: "bold",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={bug.status.replace("_", " ").toUpperCase()}
                            color={getStatusColor(bug.status)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: "bold",
                              color: theme.palette.success.main,
                            }}
                          >
                            {formatCurrency(
                              bug.reward?.final || bug.reward?.calculated || 0
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(bug.submittedAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    {recentBugs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No bug reports yet. Be the first to submit one!
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: "fit-content" }}>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <TrophyIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  🏆 Top Testers
                </Typography>
              </Box>

              <List sx={{ p: 0 }}>
                {topTesters.map((tester: Tester, index: number) => {
                  const rankColors: { [key: number]: string } = {
                    0: theme.palette.warning.main, // Gold
                    1: theme.palette.grey[400], // Silver
                    2: "#CD7F32", // Bronze
                  };

                  return (
                    <React.Fragment key={tester.id}>
                      <ListItem
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          backgroundColor:
                            index < 3
                              ? `${rankColors[index]}10`
                              : "transparent",
                          border:
                            index < 3
                              ? `1px solid ${rankColors[index]}30`
                              : "none",
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor:
                                rankColors[index] || theme.palette.primary.main,
                              fontWeight: "bold",
                            }}
                          >
                            {index < 3 ? ["🥇", "🥈", "🥉"][index] : index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: index < 3 ? "bold" : "normal" }}
                            >
                              {tester.name || `Tester ${tester.id.slice(-6)}`}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {tester.totalConfirmed} confirmed bugs
                              </Typography>
                              <Chip
                                size="small"
                                label={tester.rank}
                                sx={{
                                  mt: 0.5,
                                  backgroundColor:
                                    rankColors[index] ||
                                    theme.palette.primary.main,
                                  color: "white",
                                  fontSize: "0.7rem",
                                }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>

                      {index < topTesters.length - 1 && (
                        <Divider key={`divider-${tester.id}`} sx={{ my: 1 }} />
                      )}
                    </React.Fragment>
                  );
                })}
                {topTesters.length === 0 && (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No testers yet. Be the first!
                    </Typography>
                  </Box>
                )}
              </List>
            </CardContent>

            <CardActions>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setLeaderboardOpen(true)}
                startIcon={<VisibilityIcon />}
              >
                View Full Leaderboard
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Floating Action Button */}
      <Tooltip title="Report a Bug" placement="left">
        <Zoom in={!loading}>
          <Fab
            color="primary"
            size="large"
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              "&:hover": {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                transform: "scale(1.1)",
              },
              transition: "all 0.3s ease-in-out",
              boxShadow: theme.shadows[8],
            }}
            onClick={() => setReportFormOpen(true)}
          >
            <AddIcon sx={{ fontSize: 28 }} />
          </Fab>
        </Zoom>
      </Tooltip>

      {/* Bug Report Form */}
      <BugReportForm
        open={reportFormOpen}
        onClose={() => setReportFormOpen(false)}
        onSubmit={handleBugSubmit}
      />

      {/* Leaderboard Dialog */}
      <Dialog open={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>🏆 Bug Bounty Leaderboard</DialogTitle>
        <DialogContent>
          <List>
            {leaderboard.map((tester: Tester, index: number) => (
              <React.Fragment key={tester.id}>
                <ListItem key={`listitem-${tester.id}`}>
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: index < 3 ? theme.palette.warning.main : theme.palette.primary.main 
                    }}>
                      {index + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={tester.name || `Tester ${tester.id.slice(-6)}`}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {tester.totalConfirmed} confirmed bugs • {tester.rank} rank
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total earnings: {formatCurrency(tester.totalEarnings || 0)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < leaderboard.length - 1 && <Divider key={`divider-${tester.id}`} />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Admin Panel */}
      <BugBountyAdmin
        open={adminPanelOpen}
        onClose={() => setAdminPanelOpen(false)}
      />
    </Container>
  );
};

export default BugBountyDashboard;
