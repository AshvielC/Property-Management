'strict'
import path from 'path';

let homePage = {

    getHomePage: async (req,res) => {
        res.sendFile(path.join(process.cwd(),'view', 'homePage.html'));
    }

}

export default homePage;