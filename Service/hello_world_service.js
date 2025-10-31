const HelloWorldModel = require('../model/hello_world_model')

class HelloWorldService {
    constructor(props) {
        this.helloWorldModel = HelloWorldModel
    }
    async getHelloWorld() {
        return await this.helloWorldModel.getHelloWorld()
    }

}

export default HelloWorldService

