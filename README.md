# OrderUp

An ordering system for a small diner. Customers build their order on their phone, and it shows up instantly on a kitchen screen. The kitchen updates the order's progress, and the customer follows along live, without refreshing the page.

## Tech stack

- **NestJS + TypeScript** for the API
- **MikroORM + PostgreSQL** to store the menu and orders
- **WebSockets** for real-time updates
- **Docker** to run everything together
- **Optional:** SQS/SNS to send a notification when an order is ready, and S3 for menu photos
- **React** for a simple customer screen and a kitchen screen

## Application flow

![Application flow](app-flow.svg)

## User flow

1. The customer opens the menu and sees the available items, price and whether they're still in stock.
2. They pick items, adjust quantities and place the order. The system calculates the total and reserves the items in stock.
3. The order immediately appears on the kitchen screen as **Received**.
4. The kitchen marks the order as **Preparing** and then **Ready**. Each change shows up instantly on the customer's phone.
5. When the order is ready, the customer gets notified and picks it up.

## Key details

- **No overselling:** if there's only one burger left and two people order it at the same time, only one of them gets it.
- **No duplicate orders:** if the customer taps "Place order" twice, the system creates only one order.
