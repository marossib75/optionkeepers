rsconf = {
    _id : "rsfinance",
    members: [
        {
            "_id": 0,
            "host": "financemongodb1:27017",
            "priority": 3
        },
        {
            "_id": 1,
            "host": "financemongodb2:27017",
            "priority": 2
        },
        {
            "_id": 2,
            "host": "financemongodb3:27017",
            "priority": 1
        }
    ]
}

rs.initiate(rsconf);
rs.conf();