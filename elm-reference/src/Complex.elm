module Main exposing (main)

import Browser
import Html
import Html.Attributes as Attr
import Html.Events as Events
import Reference exposing (Reference)


replaceIf : a -> (a -> Bool) -> List a -> List a
replaceIf e f es =
    case es of
        [] ->
            []

        x :: xs ->
            if f x then
                e :: xs

            else
                x :: replaceIf e f xs


type alias Flags =
    ()


type alias Note =
    ( Int, String )


type alias Property =
    { id : Int
    , name : String
    , notes : List Note
    }


type alias Entry =
    { id : Int
    , name : String
    , properties : List Property
    }


type alias Model =
    { list : List Entry
    , seq : Int
    }


type FormId
    = EntryNameEdit (Reference Entry Model) String
    | PropertyNameEdit (Reference Property (Reference Entry Model)) String
    | NoteEdit (Reference Note (Reference Property (Reference Entry Model))) String
    | NoteAdd (Reference Property (Reference Entry Model))
    | NoteDel (Reference Note (Reference Property (Reference Entry Model)))


type Msg
    = FormEdit FormId
    | Nop


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( { list =
            [ { id = 0
              , name = "pom"
              , properties =
                    [ { id = 1
                      , name = "ayumu"
                      , notes = [ ( 2, "niji" ), ( 3, "qu" ) ]
                      }
                    ]
              }
            , { id = 4
              , name = "kas"
              , properties = []
              }
            ]
      , seq = 5
      }
    , Cmd.none
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        updateSeq m =
            { m | seq = m.seq + 1 }
    in
    case msg of
        FormEdit formId ->
            case formId of
                EntryNameEdit ref text ->
                    ( Reference.root <|
                        Reference.modify (\m -> { m | name = text }) ref
                    , Cmd.none
                    )

                PropertyNameEdit ref text ->
                    ( Reference.root <|
                        Reference.root <|
                            Reference.modify (\p -> { p | name = text }) ref
                    , Cmd.none
                    )

                NoteEdit ref text ->
                    ( Reference.root <|
                        Reference.root <|
                            Reference.root <|
                                Reference.modify (\( i, _ ) -> ( i, text )) ref
                    , Cmd.none
                    )

                NoteAdd ref ->
                    ( updateSeq <|
                        Reference.root <|
                            Reference.root <|
                                Reference.modify (\p -> { p | notes = p.notes ++ [ ( model.seq, "" ) ] }) ref
                    , Cmd.none
                    )

                NoteDel ref ->
                    let
                        ( id, _ ) =
                            Reference.this ref
                    in
                    ( Reference.root <|
                        Reference.root <|
                            Reference.modify (\p -> { p | notes = List.filter (\( id_, _ ) -> id /= id_) p.notes }) <|
                                Reference.root ref
                    , Cmd.none
                    )

        _ ->
            ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


renderNote : Reference Note (Reference Property (Reference Entry Model)) -> Html.Html Msg
renderNote ref =
    let
        ( _, note ) =
            Reference.this ref
    in
    Html.div []
        [ Html.input
            [ Attr.value note
            , Events.onInput <| FormEdit << NoteEdit ref
            ]
            []
        , Html.span [ Events.onClick <| FormEdit <| NoteDel ref ] [ Html.text "[x]" ]
        ]


renderProperty : Reference Property (Reference Entry Model) -> Html.Html Msg
renderProperty ref =
    let
        property =
            Reference.this ref

        ref_ : Note -> Reference Note (Reference Property (Reference Entry Model))
        ref_ note =
            Reference.fromRecord
                { this = note
                , rootWith =
                    \( id, t ) ->
                        Reference.modify
                            (\_ -> { property | notes = replaceIf ( id, t ) (\( id_, _ ) -> id_ == id) property.notes })
                            ref
                }
    in
    Html.div []
        [ Html.div [] [ Html.text "id: ", Html.text <| String.fromInt property.id ]
        , Html.div []
            [ Html.text "name: "
            , Html.input
                [ Attr.value property.name
                , Events.onInput <| FormEdit << PropertyNameEdit ref
                ]
                []
            ]
        , Html.div []
            [ Html.text "notes: "
            , Html.ul [] <|
                List.map (\n -> Html.li [] [ renderNote <| ref_ n ]) property.notes
                    ++ [ Html.li [ Events.onClick <| FormEdit <| NoteAdd ref ] [ Html.text "add note" ] ]
            ]
        ]


renderEntry : Reference Entry Model -> Html.Html Msg
renderEntry ref =
    let
        entry =
            Reference.this ref

        ref_ prop =
            Reference.fromRecord
                { this = prop
                , rootWith =
                    \p ->
                        Reference.modify
                            (\_ -> { entry | properties = replaceIf p (\p_ -> p_.id == p.id) entry.properties })
                            ref
                }
    in
    Html.div []
        [ Html.div [] [ Html.text "id: ", Html.text <| String.fromInt entry.id ]
        , Html.div []
            [ Html.text "name: "
            , Html.input
                [ Attr.value entry.name
                , Events.onInput <| FormEdit << EntryNameEdit ref
                ]
                []
            ]
        , Html.div []
            [ Html.text "properties:"
            , Html.ul [] <| List.map (\p -> Html.li [] [ renderProperty <| ref_ p ]) entry.properties
            ]
        ]


view : Model -> Browser.Document Msg
view model =
    let
        _ =
            Debug.log "list" model.list

        ref entry =
            Reference.fromRecord
                { this = entry
                , rootWith = \e -> { model | list = replaceIf e (\e_ -> e_.id == e.id) model.list }
                }
    in
    { title = "application"
    , body =
        [ Html.text "entries"
        , Html.ul [] <| List.map (\e -> Html.li [] [ renderEntry <| ref e ]) model.list
        ]
    }


main : Program Flags Model Msg
main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
