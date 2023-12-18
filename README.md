# Wayfare Weave

## Table of Contents

1. [Description](#description)

2. [Usage](#usage)

3. [Demo](#demo)

4. [Contributors](#contributors)

5. [Division of Labor](#division-of-labor)

6. [Reflections](#reflections)

7. [Future Improvement](#future-improvement)

## Description

Wayfare Weave is a project that aims to provide users with a map-based dining planning platform that enables them to explore and share their favorite restaurants and culinary experiences. We implemented restaurant nodes, theme planning features, comment features, map features, calendar scheduling and user authentication features.

## Usage

### Run locally

1. Open the terminal, cd to the server and start server

```

cd server

npm install

npm run dev

```

The server will start at `localhost:8000`. And if successful, it will show `MyHypermedia Backend Service`

2. Start client

```

cd client

npm install

npm run dev

```

The client will start at `localhost:3000`

### Deployed page

- Frontend: https://wayfare-weave.vercel.app/

- Backend: https://wayfare-weave.onrender.com

## Demo

- Main page
  ![Main_page](https://github.com/MRSA-J/Wayfare-Weave/blob/main/demo_image/main_page.png)

- Log in
  ![Log in page](https://github.com/MRSA-J/Wayfare-Weave/blob/main/demo_image/login.png)

- Restaurant node View
  ![Restaurant Node](https://github.com/MRSA-J/Wayfare-Weave/blob/main/demo_image/restaurant_node.png)

- Clickable Map View
  ![Map View](https://github.com/MRSA-J/Wayfare-Weave/blob/main/demo_image/map_view.png)

- Calendar View
  ![Calendar View](https://github.com/MRSA-J/Wayfare-Weave/blob/main/demo_image/calendar_view.png)
  ![Agenda View](https://github.com/MRSA-J/Wayfare-Weave/blob/main/demo_image/agenda.png)
  ![Calendar Day View](https://github.com/MRSA-J/Wayfare-Weave/blob/main/demo_image/calendar_day_view.png)

- Schedule
  ![Schedule](https://github.com/MRSA-J/Wayfare-Weave/blob/main/demo_image/schedule.png)

- Add Restaurant
  ![Add Restaurant](https://github.com/MRSA-J/Wayfare-Weave/blob/main/demo_image/add_restaurant.png)

- Search
  ![Search](https://github.com/MRSA-J/Wayfare-Weave/blob/main/demo_image/search.png)

## Contributors

- [@Chen Wei (cwei24)](https://github.com/MRSA-J)

- [@Jiayi Fan (jfan49)](https://github.com/jfan4926)

- [@Zongjie Liu (zliu178)](https://github.com/Jeeuh-Liu)

## Division of labor

We plan on working equally across X aspects of the project:

1. UI & Feature Design: Chen Wei

2. User Case Analysis: Jiayi Fan

3. Database Design, Backend Implementation: Chen Wei

- Debate about the Backend and node structure: Chen Wei, Zongjie Liu

4. Database, Backend Test:

- Backend Test: Zongjie Liu

- Backend Test using Frontend Simple UI: Chen Wei

5. Global Feature

- Map feature:

  - API usage & Autocomplete & Marker: Zongjie Liu

  - Clickable Marker: Chen Wei

- User Authentication: Jiayi Fan (Frontend), Chen Wei (Debug)
- Calendar scheduling: Zongjie Liu

6. Restaurant Node Implementation:

- Discuss node structure modification for the frontend render issue: Chen Wei, Zongjie Liu

- Frontend implementation (Restaurant information, map): Chen Wei, Zongjie Liu

- Comment board: Chen Wei

- Display/Delete/Add catetory: Jiayi Fan, Chen Wei

- Mark restaurant feature: Zongjie Liu

7. Align UI: Together

8. Readme: Jiayi Fan, Chen Wei
9. Video Transcript: Jiayi Fan

## Reflections

### Difficulties

#### Task assignment

Given the interconnected nature of our project components, task segregation and assignment to individual team members proved challenging. We encountered issues with our initial backend design during frontend implementation, as it caused rendering problems and subsequent crashes after several clicks. This necessitated backend structure adjustments throughout the development process.

As we progressed, we generated a multitude of ideas for potential backend modifications. These will be discussed in the upcoming section titled "Backend Structure Decision".

To minimize conflicts, we utilized GitHub branches. However, due to recurring backend structure conflicts, we found ourselves repeatedly adjusting the code. We then decided to create two versions of the dashboard, each using a separate database. We were planning to choose the better version and present one of these in our presentation; both should be functional and cater to slightly different user cases based on their implementation. However, later in our groupwork, though we still face a lot of disagreements and conflicts, we finally decided to merge into one solution and actively contribute to it.

In conclusion, since this project is considered "a hallmark of Brown CS classes," balancing a sophisticated design structure with a concise, user-friendly interface proved difficult at times, especially within the tight time constraints. The challenge lies in maintaining a straightforward interface that allows users to learn its functionality with minimal effort while preserving the complexity of the design structure.

#### Backend structure decision

We implemented two versions of the website, each depending on different design decisions and having their own corresponding user cases. One version is at the [main branch](https://github.com/CS1951V-F23/final-project-wayfare-weave/tree/main) and another is at the [kistch branch](https://github.com/CS1951V-F23/final-project-wayfare-weave/tree/kistch).

1. Comment (ref or embed)
   There was some debate about whether comments should be treated using the reference method or embedding method to build comment trees.

- a. Embeddings

  - Approach: Within the embedding method, we treat the comment as a node and embed it into `IIrestaurantNode` by adding an attribute `comment` to `IIrestaurantNode`. It's clear that there are trade-offs to both approaches.

  - Reasoning: The argument for treating comments as nodes and embed them into `IIrestaurantNode` is that it allows for the extension of the `INode` link method. This could potentially provide more functionality.

- b. Reference

  - Approach: Within the reference method, we extend the `INode` and add a `commentTo` attribution, which stores the nodeid of the node (can be a restaurant or comment) that is commented on. We use this reference to build the comment tree and render them with the corresponding hierarchy.

  - Reasoning: Embedding's approach might complicate the data structure and increase the complexity of operations. For example, when updating the comment node, besides updating the attributes of the comment node itself, we also need to update the `IIrestaurantNode` because comment node is embedded. This is not efficient.

- Decision: Eventually we decided to handle comments using the reference methods, instead of embedding them directly into the Restaurant nodes. Each update operation only updates the map, so only the first data load puts a significant load on the system. Subsequent operations are less burdensome. In subsequent operations, only individual nodes need to be updated, making the update process faster.
  When loading data, the system loads an array of Restaurant nodes and converts all other nodes into a map. When using the data, the system uses the reference (ref) of the comment to find the corresponding node. This design makes data retrieval and updates more efficient.

  The main reason for this approach is to allow for the simultaneous loading of the map when loading data; therefore, we don't need to traverse the entire tree structure recursively to find comments. Thus, we can quickly locate the corresponding comments on the map.

2. Whether to preserve the hierarchy structure

- a. Preserve
  - Reasoning: One solution is to preserve the file path because we want to maintain the hierarchy. The user case is more like a travel journal, as we originally planned in the proposal. In this solution, the hierarchy has folders, like "US" -> "Providence" -> "Providence's restaurant." However, since we implemented it in a different manner at the beginning, the overall design, database, and backend are different from the current version and the first checkoff.
  - Approach: To preserve the hierarchy, one approach is to reuse the original file path breadcrumb in the previous stencil. In order to meet the requirement of displaying the locational hierarchy of the restaurants, we would also need to modify the backend methods and database accordingly.
- b. Discard

  - Reasoning: The reason for not preserving the hierarchy is due to the different user cases and the complexity it brings. Preserving the hierarchy, like in another version, makes the structure more complex and the database different, which can cause issues when adding data during testing.
  - Approach: We replaced the original file directory on the left with categories. The `treeview` was completely changed, and the categories on the left are dynamically generated by looping through all categories added by users, instead of being hard-coded. In this case, the category is equivalent to the original folder, although the logic is different.

- Decision: In general, whether to preserve the hierarchy or not depends on the specific requirements of the project. If the project requires a more complex structure, like a travel journal, preserving the hierarchy might be necessary. However, if the project aims for a simpler structure where categories are dynamically generated, not preserving the hierarchy could make the design more flexible and easier to manage. At the end of the discussion and user testing, we decided that we would discard the hierarchy structure due to time constraints and the level of importance.

<!-- (save the form for future use)

| design decision | pro | con | branch | modification |
| --------------- | --- | --- | ------ | ------------ |
| aa              | a   | a   | a      | a            |
| bb              | b   | b   | b      | b            | -->

> **Final Design Decision**: reference + discard hierarchy structure

#### Map API

We use `Google Places API`, `Google Geocoding API`, and `Maps API`. The AutoCompleteService runs in the background periodically fetch the predictions about the input from the restaurant creator. When creating the restaurant, the Geocoding API fetch the latitude/longtitude and store the corresponding latitute/longtitude in the database. The Maps API support the map view and the marker. We feel we have a better understanding of useRef now. Another valuable lesson we have learnt is not to rely too much on third-party packages, even though they do simplify the use of the original API and provide a more user-friendly interface. We should have spent less time on this part if we directly chose the original API. We invested considerable time debugging a issue, only to find it was caused by dependencies of two packages are incompatiable

Our `CreateNode` function support autocomplete feature, just like Google Maps. So if the user enters a address with the restaurant name, for example, Jahunger, when they type in "Jahun", the matched result will be shown in the drop-down menu, and they can simply click it to select the location for the restaurant.

#### Calendar

We use `react-calendar` for scheduling a visit, and `react-big-calendar` to help users view their schedules. Users can drag and drop scheduled events to suit their convenience or click/select an event to delete it. The challenging aspect is about Chakra UI, which seems to have its own z-index settings. This causes issues where dropdown menus are getting hidden. Finally we decides to navigate users to the day view by clicking showing more.

### Future Improvement

If we have more time, we would:

- Redesign the UI to make it more organized and creative

- Restaurant sharing function; notification and messages

- Error checking of user input

- Community Features
- Mark Restaurants(finish the mark filtering)

- Fuzzy search implementation

![Bug Meme](https://i.chzbgr.com/thumb800/19006981/h1DCA2D7D/a-compilation-of-funny-memes-about-programming-and-computer-science)
