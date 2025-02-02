import React, { useEffect, useState } from "react";
import {
  View,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";

import { useLikes } from "../contexts/likedContext";

export const UserCalendar = ({ likes, calendarData = [], onEvent }) => {
  const headliner = (performances) => {
    return performances[0].displayName;
  };

  const formatEventDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderEventItem = ({ item }) => {
    const hasEventLike = likes.ids?.includes(item.id) ?? false;

    return (
      <TouchableOpacity style={styles.eventItem} onPress={() => onEvent(item)}>
        <Image
          style={styles.image}
          source={require("../img/music-icon-band.jpeg")}
        />
        <View style={styles.eventWrapper}>
          <Text style={styles.eventTitle}>{headliner(item.performance)}</Text>
          <Text style={styles.eventDate}>
            {formatEventDate(item.start.date)}
          </Text>
          <Text style={styles.eventVenue}>{item.venue.displayName}</Text>
        </View>
        {hasEventLike && (
          <Image
            style={styles.eventLike}
            source={require("../img/thumbs-up-selected.png")}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => {
    return <Text style={styles.header}>{title}</Text>;
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={calendarData}
        keyExtractor={(item) => item.id}
        renderItem={renderEventItem}
        renderSectionHeader={renderSectionHeader}
      />
    </View>
  );
};

export default function ConnectedUserCalendar({ navigation }) {
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const likes = useLikes();

  useEffect(() => {
    const sortCalendarData = (data) => {
      let dataMap = new Map();
      data.forEach((item) => {
        const date = new Date(item.createdAt).toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
        });
        if (!dataMap.has(date)) {
          dataMap.set(date, [item.event]);
        } else {
          const current = dataMap.get(date);
          dataMap.set(date, [...current, item.event]);
        }
      });

      return Array.from(dataMap, ([title, data]) => ({ title, data }));
    };

    const fetchCalendarData = async () => {
      const API_KEY = "1NJP9XKo6HZrYczZ";
      try {
        const response = await fetch(
          `https://api.songkick.com/api/3.0/users/super.user/calendar.json?reason=tracked_artist&apikey=${API_KEY}`
        );
        const data = await response.json();

        if (data.resultsPage.error) {
          setLoading(false);
          setError(true);
          return;
        }

        setCalendarData(
          sortCalendarData(data.resultsPage.results.calendarEntry)
        );
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCalendarData();
  }, []);

  const handleEvent = (item) => {
    navigation.navigate("Event", {
      event: item,
    });
  };

  if (error) {
    return (
      <View style={styles.baseContainer}>
        <Text>There was an error loading your data!</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.baseContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <UserCalendar
      likes={likes}
      calendarData={calendarData}
      onEvent={handleEvent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "black",
    backgroundColor: "white",
    paddingVertical: 8,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 12,
    backgroundColor: "#E4E5E7",
    marginVertical: 4,
    borderRadius: 12,
  },
  image: {
    height: 54,
    width: 54,
    marginRight: 12,
  },
  eventWrapper: {
    flex: 1,
    flexDirection: "column",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "black",
  },
  eventDate: {
    fontSize: 14,
    fontWeight: "400",
    color: "black",
  },
  eventVenue: {
    fontSize: 14,
    fontWeight: "400",
    color: "black",
  },
  eventLike: {
    marginLeft: 6,
    height: 27,
    width: 27,
  },
  baseContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
