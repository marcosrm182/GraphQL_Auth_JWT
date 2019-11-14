const graphql = require('graphql')
const Course = require('../models/course')
const Professor = require('../models/professor')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const auth = require('../utils/auth')

const { GraphQLObjectType, GraphQLID, GraphQLInt, GraphQLBoolean, GraphQLString, GraphQLList, GraphQLSchema } = graphql

// var courses = [
//     { id: '1', name: 'Patrones diseño Java', language: 'Java', date: '2022', professorId: '2'},
//     { id: '2', name: 'Patrones diseño Kotlin', language: 'Kotlin', date: '2022', professorId: '2'},
//     { id: '3', name: 'Patrones diseño C', language: 'C', date: '2022', professorId: '4'},
//     { id: '4', name: 'Patrones diseño C++', language: 'C++', date: '2022', professorId: '1'},
// ]

// var professors = [
//     { id: '1', name: 'Marcos', age: 30, active: true, date: '2022'},
//     { id: '2', name: 'Jaime', age: 25, active: false, date: '2022'},
//     { id: '3', name: 'Maria', age: 28, active: true, date: '2022'},
//     { id: '4', name: 'Celia', age: 24, active: true, date: '2022'},
// ]

// var users = [
//     { id: '1', name: 'Marcos', email: 'marcos@gmail.com', password: '1234', date: '2022'},
//     { id: '2', name: 'Ana', email: 'ana@gmail.com', password: '1234', date: '2022'},
//     { id: '3', name: 'Gloria', email: 'gloria@gmail.com', password: '1234', date: '2022'},
//     { id: '4', name: 'Sara', email: 'sara@gmail.com', password: '1234', date: '2022'},
// ]

const CourseType = new GraphQLObjectType({
    name: 'Course',
    fields: ()=>({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        language: {type: GraphQLString},
        date: {type: GraphQLString},
        professor: {
            type: ProfessorType,
            resolve(parent, arg) {
                // return professors.find(professor => professor.id === parent.professorId)
                return Professor.findById(parent.professorId)
            }
        }
    })
})

const ProfessorType = new GraphQLObjectType({
    name: 'Professor',
    fields: ()=>({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        age: {type: GraphQLInt},
        active: {type: GraphQLBoolean},
        date: {type: GraphQLString},
        course: {
            type: new GraphQLList(CourseType),
            resolve(parent, arg) {
                // return courses.filter(course => course.professorId === parent.id)
                return Course.find({ professorId: parent.id })
            }
        }
    })
})

const UserType = new GraphQLObjectType({
    name: 'Users',
    fields: ()=>({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        email: {type: GraphQLString},
        password: {type: GraphQLString},
        date: {type: GraphQLString}
    })
})

const MessageType = new GraphQLObjectType({
    name: 'Message',
    fields: ()=>({
        message: {type: GraphQLString},
        token: {type: GraphQLString},
        error: {type: GraphQLString}
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields:{
        course: {
            type: CourseType,
            args:{
                id: {type: GraphQLID}
            },
            resolve(parent, args, context){
                // return courses.find(curso => curso.id === args.id)
                if (!context.user.auth) {
                    throw new Error('Unauthenticated...')
                }
                return Course.findById(args.id)
            }
        },

        courses: {
            type: new GraphQLList(CourseType),
            resolve(parent, args){
                // return courses
                return Course.find()
            }
        },

        professor: {
            type: ProfessorType,
            args:{
                name: {type: GraphQLString}
            },
            resolve(parent, args){
                // return professors.find(professor => professor.name === args.name)
                return Professor.findOne({name: args.name})
            }
        },

        professors: {
            type: new GraphQLList(ProfessorType),
            resolve(parent, args){
                // return professors
                return Professor.find()
            }
        },

        user: {
            type: UserType,
            args:{
                email: {type: GraphQLString}
            },
            resolve(parent, args){
                return users.find(user => user.email === args.email)
            }
        }
    }
})

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addCourse: {
            type: CourseType,
            args: {
                name: {type: GraphQLString},
                language: {type: GraphQLString},
                date: {type: GraphQLString},
                professorId: {type: GraphQLID}
            },
            resolve(parent, args) {
                let course = new Course({
                    name: args.name,
                    language: args.language,
                    date: args.date,
                    professorId: args.professorId
                })
                return course.save()
            }
        },
        updateCourse: {
            type: CourseType,
            args: {
                id: {type: GraphQLID},
                name: {type: GraphQLString},
                language: {type: GraphQLString},
                date: {type: GraphQLString},
                professorId: {type: GraphQLID}
            },
            resolve(parent, args) {
                return Course.findByIdAndUpdate(
                    args.id, {
                        name: args.name,
                        language: args.language,
                        date: args.date,
                        professorId: args.professorId
                    },
                    {
                        new: true
                    }
                )
            }
        },
        deleteCourse: {
            type: CourseType,
            args: {
                id: {type: GraphQLID}
            },
            resolve(parent, args) {
                return Course.findByIdAndDelete(args.id)
            }
        },
        deleteAllCourses: {
            type: CourseType,
            resolve(parent, args) {
                return Course.deleteMany({})
            }
        },
        addProfessor: {
            type: ProfessorType,
            args: {
                name: {type: GraphQLString},
                age: {type: GraphQLInt},
                active: {type: GraphQLBoolean},
                date: {type: GraphQLString}
            },
            resolve(parent, args) {
                return Professor(args).save()
            }
        },
        updateProfessor: {
            type: ProfessorType,
            args: {
                id: {type: GraphQLID},
                name: {type: GraphQLString},
                age: {type: GraphQLInt},
                active: {type: GraphQLBoolean},
                date: {type: GraphQLString}
            },
            resolve(parent, args) {
                return Professor.findByIdAndUpdate(args.id, {
                    name: args.name,
                    age: args.age,
                    active: args.active,
                    date: args.date
                },
                {
                    new: true
                })
            }
        },
        deleteProfessor: {
            type: ProfessorType,
            args: {
                id: {type: GraphQLID}
            },
            resolve(parent, args) {
                return Professor.findByIdAndDelete(args.id)
            }
        },
        addUser: {
            type: MessageType,
            args: {
                name: {type: GraphQLString},
                email: {type: GraphQLString},
                password: {type: GraphQLString},
                date: {type: GraphQLString}
            },
            async resolve(parent, args) {
                let user = await User.findOne({email: args.email})
                if (user) {
                    return { error: 'Usuario ya existe en la base de datos'}
                }
                const salt = await bcrypt.genSalt(10)
                const hashPassword = await bcrypt.hash(args.password, salt)
                user = new User({
                    name: args.name,
                    email: args.email,
                    date: args.date,
                    password: hashPassword
                })
                user.save()
                return  { message: 'Usuarios registrado correctamente'}
            }
        },
        login: {
            type: MessageType,
            args: {
                email: {type: GraphQLString},
                password: {type: GraphQLString},
            },
            async resolve(parent, args){
                const result = await auth.login(args.email, args.password, process.env.SECRET_KEY_JWT_COURSE_API)
                return {
                    message: result.message,
                    error: result.error,
                    token: result.token
                }
            }
        },
        updateUser:{
            type: UserType,
            args:{
                id: {type: GraphQLID},
                name: {type: GraphQLString},
                date: {type: GraphQLString}
            }, 
            resolve(parent, args, context){
                if(!context.user.auth){
                    throw new Error('No estas autorizado a hacer esta operacion')
                }
                if(args.id === context.user._id){
                    return User.findByIdAndUpdate(args.id,{
                        name: args.name,
                        date: args.date
                    },
                    {
                        new: true
                    })
                }else{
                    throw new Error('No puedes modificar otro usuario')
                }
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})


